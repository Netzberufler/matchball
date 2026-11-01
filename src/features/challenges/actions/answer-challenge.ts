"use server";

import { requireSession } from "@/features/auth/lib/session";
import {
    type ChallengeItem,
    getChallengeItem,
} from "@/features/challenges/lib/queries";
import { idSchema, parseActionInput } from "@/lib/action-input";
import { revalidateAllPages } from "@/lib/revalidate";
import type { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";

// What happens to a challenge: the challenged user accepts or declines it
// before its deadline, or the challenger withdraws it. Each write only
// touches the challenge while it's still in a state that allows it and the
// signed-in user is on the right side of it, in one statement, so it can't
// be answered twice, e.g. when it was withdrawn while being accepted.
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
    );
}

// Withdraws a challenge the signed-in user made: while it's open, or
// accepted but its match isn't logged yet, so an accepted challenge that's
// never played doesn't hold the pair forever
export async function withdrawChallenge(
    challengeIdInput: unknown,
): Promise<AnswerResult> {
    const { user } = await requireSession();
    const now = new Date();
    return answerChallenge(
        challengeIdInput,
        user.id,
        {
            challengerId: user.id,
            OR: [
                { status: "OPEN", deadline: { gt: now } },
                { status: "ACCEPTED", matchId: null },
            ],
        },
        { status: "WITHDRAWN", activePair: null },
    );
}

// Applies `data` to the challenge if it still matches `where`
async function answerChallenge(
    challengeIdInput: unknown,
    userId: string,
    where: Prisma.ChallengeWhereInput,
    data: Prisma.ChallengeUpdateManyMutationInput,
): Promise<AnswerResult> {
    // Checked here: actions can be called with anything
    const challengeId = parseActionInput(idSchema, challengeIdInput);
    const { count } = await prisma.challenge.updateMany({
        where: { id: challengeId, ...where },
        data,
    });
    // Both users' tables change
    revalidateAllPages();
    return {
        error: count ? null : GONE_ERROR,
        challenge: await getChallengeItem(challengeId, userId),
    };
}
