import "server-only";

import {
    activeChallengeMessage,
    challengePair,
    cooldownEnd,
    cooldownStart,
    formatWaitTime,
} from "@/features/challenges/utils/challenge-rules";
import { prisma } from "@/prisma/db";

// Whether `userId` can challenge `challengedId` at `now`: the challenged
// user's name if so, otherwise why not. Not while there's an active
// challenge between the two, whoever made it, nor for a few days after
// the challenged user declined `userId`'s last challenge. Used when a user
// is chosen in the popup and again when the challenge is sent.
export async function checkCanChallenge(
    userId: string,
    challengedId: string,
    now: Date,
): Promise<{ error: string; name?: never } | { error: null; name: string }> {
    if (challengedId === userId) {
        return { error: "You can't challenge yourself." };
    }

    // All on indexes: the user's primary key, the unique activePair and
    // the Challenge (challengerId, challengedId, answeredAt) index
    const [challenged, active, declined] = await Promise.all([
        prisma.user.findUnique({
            where: { id: challengedId },
            select: { name: true },
        }),
        prisma.challenge.findUnique({
            where: { activePair: challengePair(userId, challengedId) },
            select: { status: true, deadline: true },
        }),
        prisma.challenge.findFirst({
            where: {
                challengerId: userId,
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
    // An open challenge past its deadline still holds the pair, but it's
    // expired, so it gives way (see createChallenge)
    if (
        active &&
        !(
            active.status === "OPEN" &&
            active.deadline.getTime() <= now.getTime()
        )
    ) {
        return { error: activeChallengeMessage(challenged.name) };
    }
    if (declined?.answeredAt) {
        const wait = formatWaitTime(cooldownEnd(declined.answeredAt), now);
        return {
            error: `${challenged.name} declined your last challenge. You can challenge them again ${wait}.`,
        };
    }
    return { error: null, name: challenged.name };
}
