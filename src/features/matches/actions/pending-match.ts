"use server";

import { z } from "zod";
import { requireSession } from "@/features/auth/lib/session";
import { idSchema, parseActionInput } from "@/lib/action-input";
import type { MatchStatus, NotificationType } from "@/prisma/generated/client";
import { revalidateAllPages } from "@/lib/revalidate";
import { prisma } from "@/prisma/db";

// What happens to a pending match: its opponent (player 2) accepts or
// declines it, or the user who logged it (player 1) withdraws it. Each sets
// the match's status and tells the other player. The write only touches the
// match while it's still pending and the signed-in user is on the right
// side of it, in one statement, so a match can't be answered twice or by
// anyone else, e.g. when it was withdrawn while the opponent was accepting
// it. `version` is the match's updatedAt as the card showed it, so an
// answer is never about a result the user hasn't seen, e.g. when the other
// player edited it in between (see update-match.ts).

// Shown when the match was answered or edited since the card was shown.
// The action reloads the page's data, which shows what it's like now.
const GONE_ERROR =
    "This match was changed or answered in the meantime. Check it again.";

// Confirms a match logged against the signed-in user, so it counts
export async function acceptMatch(
    matchIdInput: unknown,
    versionInput: unknown,
): Promise<{ error: string | null }> {
    return answerMatch(
        matchIdInput,
        versionInput,
        "player2",
        "CONFIRMED",
        "MATCH_CONFIRMED",
    );
}

// Declines a match logged against the signed-in user. It's gone from both
// players' matches; only the notifications about it still show it.
export async function declineMatch(
    matchIdInput: unknown,
    versionInput: unknown,
): Promise<{ error: string | null }> {
    return answerMatch(
        matchIdInput,
        versionInput,
        "player2",
        "DECLINED",
        "MATCH_DECLINED",
    );
}

// Withdraws a pending match the signed-in user logged, e.g. to fix a wrong
// score, like declining it
export async function withdrawMatch(
    matchIdInput: unknown,
    versionInput: unknown,
): Promise<{ error: string | null }> {
    return answerMatch(
        matchIdInput,
        versionInput,
        "player1",
        "WITHDRAWN",
        "MATCH_WITHDRAWN",
    );
}

// Sets a pending match of the signed-in user's, on `side`, to `status`, and
// notifies the other player with `type`
async function answerMatch(
    matchIdInput: unknown,
    versionInput: unknown,
    side: "player1" | "player2",
    status: Exclude<MatchStatus, "PENDING">,
    type: NotificationType,
): Promise<{ error: string | null }> {
    const { user } = await requireSession();
    // Checked here: actions can be called with anything
    const matchId = parseActionInput(idSchema, matchIdInput);
    const version = parseActionInput(z.date(), versionInput);

    const answered = await prisma.$transaction(async (tx) => {
        const [match] = await tx.match.updateManyAndReturn({
            where: {
                id: matchId,
                ...(side === "player1"
                    ? { player1Id: user.id }
                    : { player2Id: user.id }),
                status: "PENDING",
                updatedAt: version,
            },
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
    // The match list, stats and the match's own and edit pages change
    revalidateAllPages();
    return { error: answered ? null : GONE_ERROR };
}
