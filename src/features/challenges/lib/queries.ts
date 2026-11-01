import "server-only";

import type {
    ChallengeFilters,
    ChallengeStatusFilter,
} from "@/features/challenges/utils/challenge-filters";
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
    // Who logged the match, as the other player has to confirm it, and who
    // won it
    match: { select: { player1Id: true, winnerId: true } },
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
    // The other user: whom the user challenged, or who challenged them
    opponent: PublicUser;
    // The user made it, rather than received it
    isChallenger: boolean;
    state: ChallengeState;
    // Set once its match was logged: pending while the challenge is still
    // accepted, confirmed once it's played
    matchId: string | null;
    // Its match is pending and the user has to confirm it
    mustConfirmMatch: boolean;
    // Once it's played: whether the user won its match
    won: boolean | null;
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
    const isChallenger = challenge.challenger.id === userId;
    return {
        id: challenge.id,
        createdAt: challenge.createdAt,
        deadline: challenge.deadline,
        opponent: isChallenger ? challenge.challenged : challenge.challenger,
        isChallenger,
        state,
        matchId: challenge.matchId,
        mustConfirmMatch:
            state === "accepted" &&
            challenge.match !== null &&
            challenge.match.player1Id !== userId,
        won:
            state === "played" && challenge.match
                ? challenge.match.winnerId === userId
                : null,
    };
}

// The challenges of `userId` a status filter shows, as of `now`. An open
// challenge past its deadline counts as passed, as its status is only set
// to EXPIRED later (see createChallenge).
function statusWhere(
    status: ChallengeStatusFilter,
    userId: string,
    now: Date,
): Prisma.ChallengeWhereInput {
    switch (status) {
        case "open":
            return { status: "OPEN", deadline: { gt: now } };
        case "expired":
            return {
                OR: [
                    { status: "EXPIRED" },
                    { status: "OPEN", deadline: { lte: now } },
                ],
            };
        case "accepted":
            return { status: "ACCEPTED" };
        case "declined":
            return { status: "DECLINED" };
        case "withdrawn":
            return { status: "WITHDRAWN" };
        case "won":
            return { status: "PLAYED", match: { winnerId: userId } };
        case "lost":
            return { status: "PLAYED", match: { winnerId: { not: userId } } };
    }
}

// The user's challenges the filters show; with none set, all of them
function filtersWhere(
    filters: ChallengeFilters,
    userId: string,
    now: Date,
): Prisma.ChallengeWhereInput[] {
    const where: Prisma.ChallengeWhereInput[] = [];
    if (filters.statuses.length > 0) {
        where.push({
            OR: filters.statuses.map((status) =>
                statusWhere(status, userId, now),
            ),
        });
    }
    if (filters.opponentIds.length > 0) {
        where.push({
            OR: [
                {
                    challengerId: userId,
                    challengedId: { in: filters.opponentIds },
                },
                {
                    challengedId: userId,
                    challengerId: { in: filters.opponentIds },
                },
            ],
        });
    }
    return where;
}

// One page of the user's challenges, made and received, that `filters`
// show, newest first, with id breaking ties. Reads the two Challenge (user,
// createdAt, id) indexes.
export async function getChallengesPage(
    userId: string,
    filters: ChallengeFilters,
    cursor?: FeedCursor,
): Promise<FeedPage<ChallengeItem>> {
    const now = new Date();
    const challenges = await prisma.challenge.findMany({
        where: {
            AND: [
                userChallengesWhere(userId),
                ...filtersWhere(filters, userId, now),
                ...(cursor ? [olderThan(cursor)] : []),
            ],
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: CHALLENGE_PAGE_SIZE + 1,
        select: challengeSelect,
    });
    return toPage(
        challenges.map((challenge) => toChallengeItem(challenge, userId, now)),
        CHALLENGE_PAGE_SIZE,
    );
}

// Everyone the user has challenged or was challenged by, for the opponent
// filter, with how many challenges they share, most first. Counted in the
// database, from the Challenge indexes by user, so it doesn't depend on how
// many pages of the table are loaded.
export async function getChallengeOpponents(
    userId: string,
): Promise<{ user: PublicUser; count: number }[]> {
    const [challenged, challengers] = await Promise.all([
        prisma.challenge.groupBy({
            by: ["challengedId"],
            where: { challengerId: userId },
            _count: { _all: true },
        }),
        prisma.challenge.groupBy({
            by: ["challengerId"],
            where: { challengedId: userId },
            _count: { _all: true },
        }),
    ]);
    const counts = new Map<string, number>();
    for (const { challengedId, _count } of challenged) {
        counts.set(challengedId, _count._all);
    }
    for (const { challengerId, _count } of challengers) {
        counts.set(challengerId, (counts.get(challengerId) ?? 0) + _count._all);
    }
    if (counts.size === 0) {
        return [];
    }
    const users = await prisma.user.findMany({
        where: { id: { in: [...counts.keys()] } },
        select: publicUserSelect,
    });
    return users
        .map((user) => ({ user, count: counts.get(user.id) ?? 0 }))
        .sort(
            (a, b) =>
                b.count - a.count || a.user.name.localeCompare(b.user.name),
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
