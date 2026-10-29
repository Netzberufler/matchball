"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/features/auth/lib/session";
import {
    type MatchFormError,
    OPPONENT_FIELD,
    parseMatchForm,
    toMatchFormError,
} from "@/features/matches/utils/match-form";
import { getScoreWinner } from "@/features/matches/utils/match-score";
import { prisma } from "@/prisma/db";

// Saves a match the signed-in user played, with them as player 1, as
// pending until the opponent accepts it (see pending-match.ts), then goes
// to /matches. Server actions can be called with any data, not just
// the form's, so everything is checked here before anything is saved.
export async function createMatch(
    formData: FormData,
): Promise<{ error: MatchFormError }> {
    // Only signed-in users, and they can only add their own matches: player
    // 1 is always the session's user, never a value from the form
    const { user } = await requireSession();

    // The form's fields only, as text of limited length, with a valid date,
    // a user id and a finished score (see matchFormSchema)
    const parsed = parseMatchForm(formData);
    if (!parsed.success) {
        return { error: toMatchFormError(parsed.error) };
    }
    const { playedAt, opponentId, score } = parsed.data;

    // A real user, and not the signed-in one
    const opponent =
        opponentId === user.id
            ? null
            : await prisma.user.findUnique({
                  where: { id: opponentId },
                  select: { id: true },
              });
    if (!opponent) {
        return {
            error: { field: OPPONENT_FIELD, message: "Choose your opponent" },
        };
    }

    // The schema only lets finished matches through; refuse rather than
    // guess should that ever change
    const winner = getScoreWinner(score);
    if (!winner) {
        return {
            error: { field: "score", set: 1, message: "Enter the full score" },
        };
    }

    // Only the checked values are saved; the winner follows from the score.
    // The opponent's request is written with it, so it can't go missing.
    await prisma.match.create({
        data: {
            playedAt,
            player1Id: user.id,
            player2Id: opponent.id,
            winnerId: winner === "player1" ? user.id : opponent.id,
            set1Player1: score.set1Player1,
            set1Player2: score.set1Player2,
            set2Player1: score.set2Player1,
            set2Player2: score.set2Player2,
            set3Player1: score.set3Player1,
            set3Player2: score.set3Player2,
            set3IsMatchTiebreak: score.set3IsMatchTiebreak,
            status: "PENDING",
            notifications: {
                create: {
                    userId: opponent.id,
                    actorId: user.id,
                    type: "MATCH_REQUEST",
                },
            },
        },
    });

    revalidatePath("/matches");
    redirect("/matches");
}
