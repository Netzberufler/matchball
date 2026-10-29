"use server";

import { refresh } from "next/cache";
import { requireSession } from "@/features/auth/lib/session";
import { idSchema, parseActionInput } from "@/lib/action-input";
import type { MatchStatus, NotificationType } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";

// What happens to a pending match: its opponent (player 2) accepts or
// declines it, or the user who logged it (player 1) withdraws it. Each sets
// the match's status and tells the other player. The write only touches the
// match while it's still pending and the signed-in user is on the right
// side of it, in one statement, so a match can't be answered twice or by
// anyone else, e.g. when it was withdrawn while the opponent was accepting
// it.

// Shown when the match was already accepted, declined or withdrawn
const GONE_ERROR = "This match is no longer pending.";

// Confirms a match logged against the signed-in user, so it counts
export async function acceptMatch(
    matchIdInput: unknown,
): Promise<{ error: string | null }> {
    return answerMatch(matchIdInput, "player2", "CONFIRMED", "MATCH_CONFIRMED");
}

// Declines a match logged against the signed-in user. It's gone from both
// players' matches; only the notifications about it still show it.
export async function declineMatch(
    matchIdInput: unknown,
): Promise<{ error: string | null }> {
    return answerMatch(matchIdInput, "player2", "DECLINED", "MATCH_DECLINED");
}

// Withdraws a pending match the signed-in user logged, e.g. to fix a wrong
// score, like declining it
export async function withdrawMatch(
    matchIdInput: unknown,
): Promise<{ error: string | null }> {
    return answerMatch(matchIdInput, "player1", "WITHDRAWN", "MATCH_WITHDRAWN");
}

// Sets a pending match of the signed-in user's, on `side`, to `status`, and
// notifies the other player with `type`
async function answerMatch(
    matchIdInput: unknown,
    side: "player1" | "player2",
    status: Exclude<MatchStatus, "PENDING">,
    type: NotificationType,
): Promise<{ error: string | null }> {
    const { user } = await requireSession();
    // Checked here: actions can be called with anything
    const matchId = parseActionInput(idSchema, matchIdInput);

    const answered = await prisma.$transaction(async (tx) => {
        const [match] = await tx.match.updateManyAndReturn({
            where:
                side === "player1"
                    ? { id: matchId, player1Id: user.id, status: "PENDING" }
                    : { id: matchId, player2Id: user.id, status: "PENDING" },
            data: { status },
            select: { player1Id: true, player2Id: true },
        });
        // Only if this call answered it, so a double click notifies once
        if (match) {
            await tx.notification.create({
                data: {
                    userId:
                        side === "player1" ? match.player2Id : match.player1Id,
                    actorId: user.id,
                    type,
                    matchId,
                },
            });
        }
        return match !== undefined;
    });
    refresh();
    return { error: answered ? null : GONE_ERROR };
}
