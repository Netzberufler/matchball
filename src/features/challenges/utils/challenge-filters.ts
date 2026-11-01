// The filters above the challenges table. They run in the database query,
// as the table is paged; this file has no database access, so the table
// can use it too.

// A status the table shows, with a played challenge as won or lost
export type ChallengeStatusFilter =
    "open" | "accepted" | "won" | "lost" | "declined" | "withdrawn" | "expired";

// The options of the status filter menu, in the order of a challenge's life
export const CHALLENGE_STATUS_FILTERS = [
    { key: "open", label: "Open" },
    { key: "accepted", label: "Accepted" },
    { key: "won", label: "Won" },
    { key: "lost", label: "Lost" },
    { key: "declined", label: "Declined" },
    { key: "withdrawn", label: "Withdrawn" },
    { key: "expired", label: "Passed" },
] as const satisfies { key: ChallengeStatusFilter; label: string }[];

export const CHALLENGE_STATUS_KEYS = CHALLENGE_STATUS_FILTERS.map(
    ({ key }) => key,
);

export type ChallengeFilters = {
    // Empty shows every status
    statuses: ChallengeStatusFilter[];
    // Opponent user ids; empty shows every opponent
    opponentIds: string[];
};

export const NO_CHALLENGE_FILTERS: ChallengeFilters = {
    statuses: [],
    opponentIds: [],
};

// How many filters are set, for Clear filters: each status and each
// opponent counts as one
export function countActiveChallengeFilters(filters: ChallengeFilters) {
    return filters.statuses.length + filters.opponentIds.length;
}

// The same text for the same filters, whatever order they were ticked in,
// to keep the loaded pages of each combination apart
export function challengeFiltersKey(filters: ChallengeFilters) {
    return JSON.stringify({
        statuses: [...filters.statuses].sort(),
        opponentIds: [...filters.opponentIds].sort(),
    });
}
