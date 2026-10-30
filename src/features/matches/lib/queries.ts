import "server-only";

import { cache } from "react";
import { scoreField, SET_NUMBERS } from "@/features/matches/utils/match-form";
import {
    getSets,
    type MatchSide,
    type SetScore,
} from "@/features/matches/utils/match-score";
import { idSchema } from "@/lib/action-input";
import type { MatchStatus, Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";

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

// All of the user's confirmed matches, newest first, whichever side they
// played on, for /matches and their profile to filter and count. Not paged: a player logs a
// few a week at most. Reads the two Match (player, status, playedAt, id)
// indexes.
export async function getAllMatches(userId: string): Promise<UserMatch[]> {
    const matches = await prisma.match.findMany({
        where: userMatchesWhere(userId, "CONFIRMED"),
        orderBy: [{ playedAt: "desc" }, { id: "desc" }],
        select: matchSelect,
    });
    return matches.map((match) => toUserMatch(match, userId));
}

// A pending match, and whose move it is
export type PendingMatch = UserMatch & {
    // The user logged or last edited it (player 1), so the opponent has to
    // accept it. Otherwise the opponent did, and the user has to.
    isLoggedByUser: boolean;
    // Its updatedAt, sent back with an answer or edit, which only goes
    // through if the match hasn't changed since
    version: Date;
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
        select: { ...matchSelect, updatedAt: true },
    });
    return matches.map((match) => ({
        ...toUserMatch(match, userId),
        isLoggedByUser: match.player1.id === userId,
        version: match.updatedAt,
    }));
}

// A pending match as the edit form starts out: the day and the games of
// each set from the user's side, by score field name (see scoreField)
export type EditableMatch = {
    id: string;
    version: Date;
    opponent: MatchUser;
    // As the date picker takes it, e.g. "2026-10-28"
    playedAt: string;
    scores: Record<string, number | null>;
};

// One of the user's pending matches, for its edit form. Null if there's no
// such match, the user doesn't play in it, or it's no longer pending.
export async function getEditableMatch(
    matchId: string,
    userId: string,
): Promise<EditableMatch | null> {
    if (!idSchema.safeParse(matchId).success) {
        return null;
    }
    const match = await prisma.match.findFirst({
        where: { id: matchId, ...userMatchesWhere(userId, "PENDING") },
        select: { ...matchSelect, updatedAt: true },
    });
    if (!match) {
        return null;
    }
    const { opponent, sets } = toUserMatch(match, userId);
    const scores: EditableMatch["scores"] = {};
    for (const set of SET_NUMBERS) {
        scores[scoreField(set, "own")] = sets[set - 1]?.own ?? null;
        scores[scoreField(set, "opponent")] = sets[set - 1]?.opponent ?? null;
    }
    return {
        id: match.id,
        version: match.updatedAt,
        opponent,
        // Stored as midnight UTC
        playedAt: match.playedAt.toISOString().slice(0, 10),
        scores,
    };
}

// A confirmed match for its own page: both players, the one on the left
// first, and the sets from the left player's side
export type MatchDetail = {
    id: string;
    playedAt: Date;
    left: MatchUser;
    right: MatchUser;
    winner: "left" | "right";
    sets: SetScore[];
};

// A confirmed match, for its own page, or null if there's no such match or
// it isn't confirmed: pending, declined and withdrawn matches have no page.
// Anyone signed in can see it. The viewer is on the left if they played,
// otherwise player 1. The id comes from the URL, so it's checked first.
// cache() shares the lookup between generateMetadata and the page.
export const getMatch = cache(
    async (id: string, viewerId: string): Promise<MatchDetail | null> => {
        if (!idSchema.safeParse(id).success) {
            return null;
        }
        const match = await prisma.match.findFirst({
            where: { id, status: "CONFIRMED" },
            select: matchSelect,
        });
        if (!match) {
            return null;
        }
        const side: MatchSide =
            match.player2.id === viewerId ? "player2" : "player1";
        const { player, opponent, won, sets } = toUserMatch(
            match,
            match[side].id,
        );
        return {
            id: match.id,
            playedAt: match.playedAt,
            left: player,
            right: opponent,
            winner: won ? "left" : "right",
            sets,
        };
    },
);
