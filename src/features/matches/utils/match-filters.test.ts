import { describe, expect, it } from "vitest";
import {
    countActiveFilters,
    filterAndSortMatches,
    getOpponents,
    NO_MATCH_FILTERS,
} from "@/features/matches/utils/match-filters";

const anna = { id: "anna", name: "Anna" };
const ben = { id: "ben", name: "Ben" };
const carla = { id: "carla", name: "Carla" };

const matches = [
    { id: "m1", playedAt: new Date("2026-10-01"), won: true, opponent: ben },
    { id: "m2", playedAt: new Date("2026-10-03"), won: false, opponent: anna },
    { id: "m3", playedAt: new Date("2026-10-02"), won: true, opponent: anna },
    { id: "m4", playedAt: new Date("2026-10-03"), won: true, opponent: carla },
];

const ids = (list: { id: string }[]) => list.map((match) => match.id);

describe("filterAndSortMatches", () => {
    it("shows every match, newest first, without filters", () => {
        expect(
            ids(filterAndSortMatches(matches, NO_MATCH_FILTERS, "newest")),
        ).toEqual(["m4", "m2", "m3", "m1"]);
    });

    it("sorts oldest first, the same day by id", () => {
        expect(
            ids(filterAndSortMatches(matches, NO_MATCH_FILTERS, "oldest")),
        ).toEqual(["m1", "m3", "m2", "m4"]);
    });

    it("keeps only won or lost matches", () => {
        const won = { ...NO_MATCH_FILTERS, result: "won" as const };
        const lost = { ...NO_MATCH_FILTERS, result: "lost" as const };
        expect(ids(filterAndSortMatches(matches, won, "newest"))).toEqual([
            "m4",
            "m3",
            "m1",
        ]);
        expect(ids(filterAndSortMatches(matches, lost, "newest"))).toEqual([
            "m2",
        ]);
    });

    it("keeps matches against the chosen opponents", () => {
        const filters = {
            result: "won" as const,
            opponentIds: ["anna", "ben"],
        };
        expect(ids(filterAndSortMatches(matches, filters, "newest"))).toEqual([
            "m3",
            "m1",
        ]);
    });

    it("leaves the given list as it was", () => {
        filterAndSortMatches(matches, NO_MATCH_FILTERS, "oldest");
        expect(ids(matches)).toEqual(["m1", "m2", "m3", "m4"]);
    });
});

describe("countActiveFilters", () => {
    it("counts the result and each opponent", () => {
        expect(countActiveFilters(NO_MATCH_FILTERS)).toBe(0);
        expect(
            countActiveFilters({
                result: "lost",
                opponentIds: ["anna", "ben"],
            }),
        ).toBe(3);
    });
});

describe("getOpponents", () => {
    it("lists each opponent once, most played first, then by name", () => {
        expect(getOpponents(matches)).toEqual([
            { user: anna, matchCount: 2 },
            { user: ben, matchCount: 1 },
            { user: carla, matchCount: 1 },
        ]);
    });
});
