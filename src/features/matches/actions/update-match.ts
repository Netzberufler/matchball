"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireSession } from "@/features/auth/lib/session";
import {
    type MatchFormError,
    parseEditMatchForm,
    toMatchFormError,
} from "@/features/matches/utils/match-form";
import {
    getScoreWinner,
    isSameScore,
    type MatchSide,
} from "@/features/matches/utils/match-score";
import { idSchema, parseActionInput } from "@/lib/action-input";
import { revalidateAllPages } from "@/lib/revalidate";
import { prisma } from "@/prisma/db";

// Changes the date or score of a pending match the signed-in user plays
// in, then goes to /matches. Either player can: the editor proposes the
// new result, so they become player 1, like when logging a match, and the
// other player has to accept or decline it, whoever that was before. The
// other player is notified.
//
// `version` is the match's updatedAt when the form was loaded. The match is
// only saved if it's still that version, so neither player overwrites a
// change of the other's they haven't seen.
export async function updateMatch(
    matchIdInput: unknown,
    versionInput: unknown,
    formData: FormData,
): Promise<{ error: MatchFormError }> {
    const { user } = await requireSession();
    // Checked here: actions can be called with anything
    const matchId = parseActionInput(idSchema, matchIdInput);
    const version = parseActionInput(z.date(), versionInput);

    const parsed = parseEditMatchForm(formData);
    if (!parsed.success) {
        return { error: toMatchFormError(parsed.error) };
    }
    const { playedAt, score } = parsed.data;

    // The schema only lets finished matches through; refuse rather than
    // guess should that ever change
    const winner = getScoreWinner(score);
    if (!winner) {
        return {
            error: { field: "score", set: 1, message: "Enter the full score" },
        };
    }

    const error = await prisma.$transaction(async (tx) => {
        const match = await tx.match.findFirst({
            where: {
                id: matchId,
                status: "PENDING",
                OR: [{ player1Id: user.id }, { player2Id: user.id }],
            },
        });
        if (!match) {
            return GONE_ERROR;
        }
        if (match.updatedAt.getTime() !== version.getTime()) {
            return CHANGED_ERROR;
        }
        const side: MatchSide =
            match.player1Id === user.id ? "player1" : "player2";
        if (
            match.playedAt.getTime() === playedAt.getTime() &&
            isSameScore(match, side, score, "player1")
        ) {
            return UNCHANGED_ERROR;
        }

        const opponentId =
            side === "player1" ? match.player2Id : match.player1Id;
        // Only while it's still the version that was checked, in case the
        // other player saved or answered it in between
        const { count } = await tx.match.updateMany({
            where: { id: matchId, status: "PENDING", updatedAt: version },
            data: {
                playedAt,
                player1Id: user.id,
                player2Id: opponentId,
                winnerId: winner === "player1" ? user.id : opponentId,
                ...score,
            },
        });
        if (!count) {
            return CHANGED_ERROR;
        }
        await tx.notification.create({
            data: {
                userId: opponentId,
                actorId: user.id,
                type: "MATCH_UPDATED",
                matchId,
            },
        });
        return null;
    });
    if (error) {
        return { error };
    }

    // Also the edit pages the browser keeps: without this, editing again
    // would start from the old date and score
    revalidateAllPages();
    redirect("/matches");
}

const GONE_ERROR: MatchFormError = {
    field: "form",
    message: "This match is no longer pending, so it can't be changed.",
};

const CHANGED_ERROR: MatchFormError = {
    field: "form",
    message:
        "The match was changed since you opened it. Reload the page to see the latest version.",
};

const UNCHANGED_ERROR: MatchFormError = {
    field: "form",
    message: "Nothing has changed yet. Change the date or the score to save.",
};
