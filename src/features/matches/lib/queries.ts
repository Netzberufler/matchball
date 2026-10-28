import "server-only";

import type { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";
import {
    getSets,
    type MatchSide,
    type SetScore,
} from "@/features/matches/utils/match-score";

// How many of a user's latest matches /matches shows
const RECENT_MATCHES_LIMIT = 50;

const userSelect = { id: true, username: true, name: true, image: true };

const matchSelect = {
    id: true,
    playedAt: true,
    winnerId: true,
    player1: { select: userSelect },
    player2: { select: userSelect },
    set1Player1: true,
    set1Player2: true,
    set2Player1: true,
    set2Player2: true,
    set3Player1: true,
    set3Player2: true,
    set3IsMatchTiebreak: true,
} satisfies Prisma.MatchSelect;

// A match from one player's point of view
export type UserMatch = {
    id: string;
    playedAt: Date;
    opponent: Prisma.UserGetPayload<{ select: typeof userSelect }>;
    won: boolean;
    // The player's games first
    sets: SetScore[];
};

// The user's latest matches, newest first, whichever side they played on.
// Reads the two Match (player, playedAt, id) indexes.
export async function getRecentMatches(userId: string): Promise<UserMatch[]> {
    const matches = await prisma.match.findMany({
        where: { OR: [{ player1Id: userId }, { player2Id: userId }] },
        orderBy: [{ playedAt: "desc" }, { id: "desc" }],
        take: RECENT_MATCHES_LIMIT,
        select: matchSelect,
    });
    return matches.map((match) => {
        const side: MatchSide =
            match.player1.id === userId ? "player1" : "player2";
        return {
            id: match.id,
            playedAt: match.playedAt,
            opponent: side === "player1" ? match.player2 : match.player1,
            won: match.winnerId === userId,
            sets: getSets(match, side),
        };
    });
}
