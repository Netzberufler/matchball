"use server";

import { z } from "zod";
import { requireSession } from "@/features/auth/lib/session";
import {
    challengePair,
    checkDeadline,
    cooldownEnd,
    cooldownStart,
    formatWaitTime,
} from "@/features/challenges/utils/challenge-rules";
import { idSchema, parseActionInput } from "@/lib/action-input";
import { revalidateAllPages } from "@/lib/revalidate";
import { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";

// The signed-in user challenges another user to a match, to be accepted or
// declined until `deadline`. Refused while there's an active challenge
// between the two, whoever made it, and for a few days after the other
// user declined the signed-in user's last challenge.
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
    if (challengedId === user.id) {
        return { error: "You can't challenge yourself." };
    }

    // Both on indexes: the user's primary key, and the Challenge
    // (challengerId, challengedId, answeredAt) index
    const [challenged, declined] = await Promise.all([
        prisma.user.findUnique({
            where: { id: challengedId },
            select: { name: true },
        }),
        prisma.challenge.findFirst({
            where: {
                challengerId: user.id,
                challengedId,
                status: "DECLINED",
                answeredAt: { gt: cooldownStart(now) },
            },
            orderBy: { answeredAt: "desc" },
            select: { answeredAt: true },
        }),
    ]);
    if (!challenged) {
        return { error: "This player doesn't exist anymore." };
    }
    if (declined?.answeredAt) {
        const wait = formatWaitTime(cooldownEnd(declined.answeredAt), now);
        return {
            error: `${challenged.name} declined your last challenge. You can challenge them again ${wait}.`,
        };
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
                },
                select: { id: true },
            }),
        ]);
    } catch (error) {
        // The unique activePair: there's an open or accepted challenge
        // between the two already, maybe made by the other one just now
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return {
                error: `You and ${challenged.name} already have a challenge going. Play it first, or wait until it's answered.`,
            };
        }
        throw error;
    }

    // Shows in both users' tables
    revalidateAllPages();
    return { error: null };
}
