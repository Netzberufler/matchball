"use server";

import { z } from "zod";
import { requireSession } from "@/features/auth/lib/session";
import { checkCanChallenge } from "@/features/challenges/lib/challenge-checks";
import {
    activeChallengeMessage,
    challengePair,
    checkDeadline,
} from "@/features/challenges/utils/challenge-rules";
import { idSchema, parseActionInput } from "@/lib/action-input";
import { revalidateAllPages } from "@/lib/revalidate";
import { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";

// Whether the signed-in user can challenge this user now, checked as soon
// as they're chosen in the popup, so it can say why not before a deadline
// is picked. `error` is null if they can.
export async function checkChallenge(
    challengedIdInput: unknown,
): Promise<{ error: string | null }> {
    const { user } = await requireSession();
    // Checked here: actions can be called with anything
    const challengedId = parseActionInput(idSchema, challengedIdInput);
    const { error } = await checkCanChallenge(
        user.id,
        challengedId,
        new Date(),
    );
    return { error };
}

// The signed-in user challenges another user to a match, to be accepted or
// declined until `deadline`. Refused while there's an active challenge
// between the two, whoever made it, and for a few days after the other
// user declined the signed-in user's last challenge (see checkCanChallenge).
export async function createChallenge(
    challengedIdInput: unknown,
    deadlineInput: unknown,
): Promise<{ error: string | null }> {
    const { user } = await requireSession();
    // Checked here: actions can be called with anything
    const challengedId = parseActionInput(idSchema, challengedIdInput);
    const deadline = parseActionInput(z.date(), deadlineInput);

    const now = new Date();
    const deadlineError = checkDeadline(deadline, now);
    if (deadlineError) {
        return { error: deadlineError };
    }
    const check = await checkCanChallenge(user.id, challengedId, now);
    if (check.error !== null) {
        return { error: check.error };
    }

    const activePair = challengePair(user.id, challengedId);
    try {
        await prisma.$transaction([
            // An open challenge past its deadline still holds the pair;
            // it's expired, so it gives way
            prisma.challenge.updateMany({
                where: { activePair, status: "OPEN", deadline: { lte: now } },
                data: { status: "EXPIRED", activePair: null },
            }),
            prisma.challenge.create({
                data: {
                    challengerId: user.id,
                    challengedId,
                    deadline,
                    activePair,
                    // The challenged user's request, written with it
                    notifications: {
                        create: {
                            userId: challengedId,
                            actorId: user.id,
                            type: "CHALLENGE_REQUEST",
                        },
                    },
                },
                select: { id: true },
            }),
        ]);
    } catch (error) {
        // The unique activePair: the other one challenged this user just
        // now, after the check above
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return { error: activeChallengeMessage(check.name) };
        }
        throw error;
    }

    // Shows in both users' tables and the challenged user's notifications
    revalidateAllPages();
    return { error: null };
}
