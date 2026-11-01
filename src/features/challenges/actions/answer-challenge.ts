"use server";

import { requireSession } from "@/features/auth/lib/session";
import {
    type ChallengeItem,
    getChallengeItem,
} from "@/features/challenges/lib/queries";
import { idSchema, parseActionInput } from "@/lib/action-input";
import { revalidateAllPages } from "@/lib/revalidate";
import type { NotificationType, Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";

// What happens to a challenge: the challenged user accepts or declines it
// before its deadline, or the challenger withdraws it. Each write only
// touches the challenge while it's still in a state that allows it and the
// signed-in user is on the right side of it, in one statement, so it can't
// be answered twice, e.g. when it was withdrawn while being accepted.
// The other user is notified in the same transaction.
// Each returns the challenge as it is now, for the row in the table, which
// may be on a page further down that the refresh doesn't reach.

type AnswerResult = { error: string | null; challenge: ChallengeItem | null };

// Shown when the challenge changed since the table was shown
const GONE_ERROR =
    "This challenge was answered, withdrawn or has expired in the meantime.";

// Accepts a challenge the signed-in user received; then either can log the
// match
export async function acceptChallenge(
    challengeIdInput: unknown,
): Promise<AnswerResult> {
    const { user } = await requireSession();
    const now = new Date();
    return answerChallenge(
        challengeIdInput,
        user.id,
        { challengedId: user.id, status: "OPEN", deadline: { gt: now } },
        { status: "ACCEPTED", answeredAt: now },
        "CHALLENGE_ACCEPTED",
    );
}

// Declines a challenge the signed-in user received. Its challenger can't
// challenge them again for a few days (see createChallenge).
export async function declineChallenge(
    challengeIdInput: unknown,
): Promise<AnswerResult> {
    const { user } = await requireSession();
    const now = new Date();
    return answerChallenge(
        challengeIdInput,
        user.id,
        { challengedId: user.id, status: "OPEN", deadline: { gt: now } },
        { status: "DECLINED", answeredAt: now, activePair: null },
        "CHALLENGE_DECLINED",
    );
}

// Withdraws a challenge the signed-in user made, only while it's open:
// once accepted, it's on
export async function withdrawChallenge(
    challengeIdInput: unknown,
): Promise<AnswerResult> {
    const { user } = await requireSession();
    const now = new Date();
    return answerChallenge(
        challengeIdInput,
        user.id,
        { challengerId: user.id, status: "OPEN", deadline: { gt: now } },
        { status: "WITHDRAWN", activePair: null },
        "CHALLENGE_WITHDRAWN",
    );
}

// Applies `data` to the challenge if it still matches `where`, and notifies
// the other user with `type`
async function answerChallenge(
    challengeIdInput: unknown,
    userId: string,
    where: Prisma.ChallengeWhereInput,
    data: Prisma.ChallengeUpdateManyMutationInput,
    type: NotificationType,
): Promise<AnswerResult> {
    // Checked here: actions can be called with anything
    const challengeId = parseActionInput(idSchema, challengeIdInput);
    const answered = await prisma.$transaction(async (tx) => {
        const [challenge] = await tx.challenge.updateManyAndReturn({
            where: { id: challengeId, ...where },
            data,
            select: { challengerId: true, challengedId: true },
        });
        // Only if this call changed it, so a double click notifies once
        if (challenge) {
            await tx.notification.create({
                data: {
                    userId:
                        challenge.challengerId === userId
                            ? challenge.challengedId
                            : challenge.challengerId,
                    actorId: userId,
                    type,
                    challengeId,
                },
            });
        }
        return challenge !== undefined;
    });
    // Both users' tables and the other user's notifications change
    revalidateAllPages();
    return {
        error: answered ? null : GONE_ERROR,
        challenge: await getChallengeItem(challengeId, userId),
    };
}
