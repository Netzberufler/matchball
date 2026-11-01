import "server-only";

import {
    type ChallengeState,
    challengeState,
} from "@/features/challenges/utils/challenge-rules";
import {
    type FeedCursor,
    type FeedPage,
    olderThan,
    toPage,
} from "@/features/posts/utils/feed";
import {
    type PublicUser,
    publicUserSelect,
} from "@/features/profile/utils/public-user";
import { idSchema } from "@/lib/action-input";
import type { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";

// Challenges are only shown to their two users: every query here takes the
// signed-in user's id and only finds challenges they're on either side of.

// Challenges shown per page on /challenges
const CHALLENGE_PAGE_SIZE = 20;

const challengeSelect = {
    id: true,
    createdAt: true,
    deadline: true,
    status: true,
    matchId: true,
    challenger: { select: publicUserSelect },
    challenged: { select: publicUserSelect },
    // Who logged the match: the other player has to confirm it
    match: { select: { player1Id: true } },
} satisfies Prisma.ChallengeSelect;

type ChallengeRow = Prisma.ChallengeGetPayload<{
    select: typeof challengeSelect;
}>;

// A challenge as the signed-in user sees it in the table
export type ChallengeItem = {
    id: string;
    // When it was made
    createdAt: Date;
    deadline: Date;
    challenger: PublicUser;
    challenged: PublicUser;
    // The user made it, rather than received it
    isChallenger: boolean;
    state: ChallengeState;
    // Set once its match was logged: pending while the challenge is still
    // accepted, confirmed once it's played
    matchId: string | null;
    // Its match is pending and the user has to confirm it
    mustConfirmMatch: boolean;
};

// Where the user is on either side
function userChallengesWhere(userId: string): Prisma.ChallengeWhereInput {
    return { OR: [{ challengerId: userId }, { challengedId: userId }] };
}

// A challenge from `userId`'s side, its state as of `now`
function toChallengeItem(
    challenge: ChallengeRow,
    userId: string,
    now: Date,
): ChallengeItem {
    const state = challengeState(challenge.status, challenge.deadline, now);
    return {
        id: challenge.id,
        createdAt: challenge.createdAt,
        deadline: challenge.deadline,
        challenger: challenge.challenger,
        challenged: challenge.challenged,
        isChallenger: challenge.challenger.id === userId,
        state,
        matchId: challenge.matchId,
        mustConfirmMatch:
            state === "accepted" &&
            challenge.match !== null &&
            challenge.match.player1Id !== userId,
    };
}

// One page of the user's challenges, made and received, newest first, with
// id breaking ties. Reads the two Challenge (user, createdAt, id) indexes.
export async function getChallengesPage(
    userId: string,
    cursor?: FeedCursor,
): Promise<FeedPage<ChallengeItem>> {
    const challenges = await prisma.challenge.findMany({
        where: {
            AND: [
                userChallengesWhere(userId),
                ...(cursor ? [olderThan(cursor)] : []),
            ],
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: CHALLENGE_PAGE_SIZE + 1,
        select: challengeSelect,
    });
    const now = new Date();
    return toPage(
        challenges.map((challenge) => toChallengeItem(challenge, userId, now)),
        CHALLENGE_PAGE_SIZE,
    );
}

// One of the user's challenges as it is now, e.g. after they answered it,
// or null if there's no such challenge of theirs
export async function getChallengeItem(
    challengeId: string,
    userId: string,
): Promise<ChallengeItem | null> {
    const challenge = await prisma.challenge.findFirst({
        where: { id: challengeId, ...userChallengesWhere(userId) },
        select: challengeSelect,
    });
    return challenge ? toChallengeItem(challenge, userId, new Date()) : null;
}

// An accepted challenge of the user's whose match hasn't been logged yet,
// for the add match form, with the opponent it fixes. Null if there's no
// such challenge. The id comes from the URL, so it's checked first.
export async function getLoggableChallenge(
    challengeId: string,
    userId: string,
): Promise<{ id: string; opponent: PublicUser } | null> {
    if (!idSchema.safeParse(challengeId).success) {
        return null;
    }
    const challenge = await prisma.challenge.findFirst({
        where: {
            id: challengeId,
            status: "ACCEPTED",
            matchId: null,
            ...userChallengesWhere(userId),
        },
        select: {
            id: true,
            challenger: { select: publicUserSelect },
            challenged: { select: publicUserSelect },
        },
    });
    if (!challenge) {
        return null;
    }
    return {
        id: challenge.id,
        opponent:
            challenge.challenger.id === userId
                ? challenge.challenged
                : challenge.challenger,
    };
}
