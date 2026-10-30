// Statistics over a player's confirmed matches, for the cards on /matches.
// No database access, so it can be tested on its own.

import type { SetScore } from "@/features/matches/utils/match-score";

// The fields of a match the statistics read
type StatsMatch = { won: boolean; sets: SetScore[] };

// Won and lost of something: matches, sets, games or match tiebreaks
export type WinLoss = { won: number; lost: number };

// Which matches the statistics cover, by when they were played
export type StatsPeriod = "month" | "year" | "all";

// The options of the period menu, in order
export const STATS_PERIODS = [
    { key: "month", label: "This month" },
    { key: "year", label: "This year" },
    { key: "all", label: "All time" },
] as const satisfies { key: StatsPeriod; label: string }[];

// Whether a match played at `playedAt` falls in `period`: the calendar
// month or year of `now`, in UTC like playedAt, or any time
export function isInStatsPeriod(
    playedAt: Date,
    period: StatsPeriod,
    now: Date = new Date(),
) {
    const sameYear = playedAt.getUTCFullYear() === now.getUTCFullYear();
    if (period === "year") {
        return sameYear;
    }
    if (period === "month") {
        return sameYear && playedAt.getUTCMonth() === now.getUTCMonth();
    }
    return true;
}

export type MatchStats = {
    matches: WinLoss;
    // A match tiebreak counts as a set, but its points aren't games
    sets: WinLoss;
    games: WinLoss;
    matchTiebreaks: WinLoss;
};

// The statistics of `matches`
export function getMatchStats(matches: StatsMatch[]): MatchStats {
    const stats: MatchStats = {
        matches: { won: 0, lost: 0 },
        sets: { won: 0, lost: 0 },
        games: { won: 0, lost: 0 },
        matchTiebreaks: { won: 0, lost: 0 },
    };
    for (const match of matches) {
        add(stats.matches, match.won);
        for (const set of match.sets) {
            add(stats.sets, set.own > set.opponent);
            if (set.isMatchTiebreak) {
                add(stats.matchTiebreaks, set.own > set.opponent);
            } else {
                stats.games.won += set.own;
                stats.games.lost += set.opponent;
            }
        }
    }
    return stats;
}

function add(record: WinLoss, won: boolean) {
    if (won) {
        record.won++;
    } else {
        record.lost++;
    }
}

// The share won, as a whole percentage, or null if nothing was played
export function winPercentage({ won, lost }: WinLoss) {
    const total = won + lost;
    return total === 0 ? null : Math.round((won / total) * 100);
}
