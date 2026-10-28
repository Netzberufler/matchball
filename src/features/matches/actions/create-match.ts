"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/features/auth/lib/session";
import {
    OPPONENT_FIELD,
    PLAYED_AT_FIELD,
    parsePlayedAt,
    readEnteredSets,
} from "@/features/matches/utils/match-form";
import {
    getScoreWinner,
    parseEnteredScore,
    type ScoreError,
} from "@/features/matches/utils/match-score";
import { prisma } from "@/prisma/db";

export type MatchFormError =
    | { field: typeof PLAYED_AT_FIELD | typeof OPPONENT_FIELD; message: string }
    | { field: "score"; set: ScoreError["set"]; message: string };

// Saves a match the signed-in user played, with them as player 1, then
// goes to /matches
export async function createMatch(
    formData: FormData,
): Promise<{ error: MatchFormError }> {
    const { user } = await requireSession();

    // Validated again here: actions can be called without the form
    const playedAt = parsePlayedAt(formData.get(PLAYED_AT_FIELD));
    if (!playedAt) {
        return {
            error: {
                field: PLAYED_AT_FIELD,
                message: "Choose the day you played, today or earlier",
            },
        };
    }

    const opponentId = String(formData.get(OPPONENT_FIELD) ?? "");
    const opponent = /^[0-9a-f-]{36}$/i.test(opponentId)
        ? await prisma.user.findUnique({
              where: { id: opponentId },
              select: { id: true },
          })
        : null;
    if (!opponent || opponent.id === user.id) {
        return {
            error: { field: OPPONENT_FIELD, message: "Choose your opponent" },
        };
    }

    const { score, error } = parseEnteredScore(readEnteredSets(formData));
    if (error) {
        return { error: { field: "score", ...error } };
    }

    await prisma.match.create({
        data: {
            playedAt,
            player1Id: user.id,
            player2Id: opponent.id,
            // parseEnteredScore only returns finished matches
            winnerId:
                getScoreWinner(score) === "player1" ? user.id : opponent.id,
            ...score,
        },
    });

    revalidatePath("/matches");
    redirect("/matches");
}
