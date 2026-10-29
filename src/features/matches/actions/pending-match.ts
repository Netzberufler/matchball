"use server";

import { refresh } from "next/cache";
import { requireSession } from "@/features/auth/lib/session";
import { idSchema, parseActionInput } from "@/lib/action-input";
import type { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";

// What happens to a pending match: its opponent (player 2) accepts or
// declines it, or the user who logged it (player 1) withdraws it. Each
// write only touches the match while it's still pending and the signed-in
// user is on the right side of it, in one statement, so a match can't be
// answered twice or by anyone else, e.g. when it was withdrawn while the
// opponent was accepting it.

// Shown when the match was already accepted, declined or withdrawn
const GONE_ERROR = "This match is no longer pending.";

// Confirms a match logged against the signed-in user, so it counts, and
// tells the user who logged it
export async function acceptMatch(
    matchIdInput: unknown,
): Promise<{ error: string | null }> {
    const { user } = await requireSession();
    // Checked here: actions can be called with anything
    const matchId = parseActionInput(idSchema, matchIdInput);

    const accepted = await prisma.$transaction(async (tx) => {
        const [match] = await tx.match.updateManyAndReturn({
            where: { id: matchId, player2Id: user.id, status: "PENDING" },
            data: { status: "CONFIRMED" },
            select: { player1Id: true },
        });
        if (match) {
            await tx.notification.create({
                data: {
                    userId: match.player1Id,
                    actorId: user.id,
                    type: "MATCH_CONFIRMED",
                    matchId,
                },
            });
        }
        return match !== undefined;
    });
    refresh();
    return { error: accepted ? null : GONE_ERROR };
}

// Deletes a match logged against the signed-in user, with its request, and
// tells the user who logged it
export async function declineMatch(
    matchIdInput: unknown,
): Promise<{ error: string | null }> {
    const { user } = await requireSession();
    const matchId = parseActionInput(idSchema, matchIdInput);

    const pending = {
        id: matchId,
        player2Id: user.id,
        status: "PENDING",
    } satisfies Prisma.MatchWhereInput;
    const declined = await prisma.$transaction(async (tx) => {
        const match = await tx.match.findFirst({
            where: pending,
            select: { player1Id: true },
        });
        // Only if this call deleted it, so a double click notifies once
        const { count } = match
            ? await tx.match.deleteMany({ where: pending })
            : { count: 0 };
        if (!match || !count) {
            return false;
        }
        // Not about the match, which is gone
        await tx.notification.create({
            data: {
                userId: match.player1Id,
                actorId: user.id,
                type: "MATCH_DECLINED",
            },
        });
        return true;
    });
    refresh();
    return { error: declined ? null : GONE_ERROR };
}

// Deletes a pending match the signed-in user logged, e.g. to fix a wrong
// score. The opponent's request goes with it.
export async function withdrawMatch(
    matchIdInput: unknown,
): Promise<{ error: string | null }> {
    const { user } = await requireSession();
    const matchId = parseActionInput(idSchema, matchIdInput);

    const { count } = await prisma.match.deleteMany({
        where: { id: matchId, player1Id: user.id, status: "PENDING" },
    });
    refresh();
    return { error: count ? null : GONE_ERROR };
}
