// Filtering and sorting a player's matches on /matches. No database access,
// so the table can apply them on the client.

export type MatchResultFilter = "all" | "won" | "lost";

export type MatchSortOrder = "newest" | "oldest";

export type MatchFilters = {
    result: MatchResultFilter;
    // Opponent user ids; empty shows every opponent
    opponentIds: string[];
};

export const NO_MATCH_FILTERS: MatchFilters = {
    result: "all",
    opponentIds: [],
};

// The options of the result filter menu
export const MATCH_RESULT_FILTERS = [
    { key: "all", label: "All results" },
    { key: "won", label: "Won" },
    { key: "lost", label: "Lost" },
] as const satisfies { key: MatchResultFilter; label: string }[];

// The options of the sort menu
export const MATCH_SORT_ORDERS = [
    { key: "newest", label: "Newest first" },
    { key: "oldest", label: "Oldest first" },
] as const satisfies { key: MatchSortOrder; label: string }[];

// The fields of a match the filters and sorting read
type FilterableMatch = {
    id: string;
    playedAt: Date;
    won: boolean;
    opponent: { id: string };
};

// How many filters are set, for the "5 of 32" count and Clear filters: the
// result counts as one, and so does each opponent
export function countActiveFilters(filters: MatchFilters) {
    return (filters.result === "all" ? 0 : 1) + filters.opponentIds.length;
}

// The matches that pass the filters, in `order`. Matches played on the same
// day keep the order of their ids, newest first or last like the days.
export function filterAndSortMatches<T extends FilterableMatch>(
    matches: T[],
    filters: MatchFilters,
    order: MatchSortOrder,
): T[] {
    const opponentIds = new Set(filters.opponentIds);
    const direction = order === "newest" ? -1 : 1;
    return matches
        .filter(
            (match) =>
                (filters.result === "all" ||
                    match.won === (filters.result === "won")) &&
                (opponentIds.size === 0 || opponentIds.has(match.opponent.id)),
        )
        .sort(
            (a, b) =>
                direction *
                (a.playedAt.getTime() - b.playedAt.getTime() ||
                    a.id.localeCompare(b.id)),
        );
}

// Everyone the player has played, once each, with how many matches, most
// played first and then by name
export function getOpponents<U extends { id: string; name: string }>(
    matches: { opponent: U }[],
): { user: U; matchCount: number }[] {
    const opponents = new Map<string, { user: U; matchCount: number }>();
    for (const { opponent } of matches) {
        const entry = opponents.get(opponent.id);
        if (entry) {
            entry.matchCount++;
        } else {
            opponents.set(opponent.id, { user: opponent, matchCount: 1 });
        }
    }
    return [...opponents.values()].sort(
        (a, b) =>
            b.matchCount - a.matchCount ||
            a.user.name.localeCompare(b.user.name),
    );
}
