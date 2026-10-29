import "server-only";

import type { MatchStatus, Prisma } from "@/prisma/generated/client";
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

type MatchUser = Prisma.UserGetPayload<{ select: typeof userSelect }>;

// A match from one player's point of view
export type UserMatch = {
    id: string;
    playedAt: Date;
    // The user whose matches these are
    player: MatchUser;
    opponent: MatchUser;
    won: boolean;
    // The player's games first
    sets: SetScore[];
};

// Where a user played on either side, in one status. Every query of
// matches filters by status, so pending matches never count as played.
function userMatchesWhere(
    userId: string,
    status: MatchStatus,
): Prisma.MatchWhereInput {
    return { OR: [{ player1Id: userId }, { player2Id: userId }], status };
}

type MatchRow = Prisma.MatchGetPayload<{ select: typeof matchSelect }>;

// A match from `userId`'s side
function toUserMatch(match: MatchRow, userId: string): UserMatch {
    const side: MatchSide = match.player1.id === userId ? "player1" : "player2";
    return {
        id: match.id,
        playedAt: match.playedAt,
        player: side === "player1" ? match.player1 : match.player2,
        opponent: side === "player1" ? match.player2 : match.player1,
        won: match.winnerId === userId,
        sets: getSets(match, side),
    };
}

// The user's latest confirmed matches, newest first, whichever side they
// played on. Reads the two Match (player, status, playedAt, id) indexes.
export async function getRecentMatches(userId: string): Promise<UserMatch[]> {
    const matches = await prisma.match.findMany({
        where: userMatchesWhere(userId, "CONFIRMED"),
        orderBy: [{ playedAt: "desc" }, { id: "desc" }],
        take: RECENT_MATCHES_LIMIT,
        select: matchSelect,
    });
    return matches.map((match) => toUserMatch(match, userId));
}

// A pending match, and whose move it is
export type PendingMatch = UserMatch & {
    // The user logged it (player 1), so the opponent has to accept it.
    // Otherwise the opponent logged it, and the user has to.
    isLoggedByUser: boolean;
};

// All of the user's pending matches, newest first: the ones they logged
// and the ones they have to accept or decline. There are few, as each is
// answered or withdrawn, so they aren't limited.
export async function getPendingMatches(
    userId: string,
): Promise<PendingMatch[]> {
    const matches = await prisma.match.findMany({
        where: userMatchesWhere(userId, "PENDING"),
        orderBy: [{ playedAt: "desc" }, { id: "desc" }],
        select: matchSelect,
    });
    return matches.map((match) => ({
        ...toUserMatch(match, userId),
        isLoggedByUser: match.player1.id === userId,
    }));
}
