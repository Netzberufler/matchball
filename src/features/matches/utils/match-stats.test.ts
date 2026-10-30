import { describe, expect, it } from "vitest";
import {
    getMatchStats,
    isInStatsPeriod,
    winPercentage,
} from "@/features/matches/utils/match-stats";

function set(own: number, opponent: number, isMatchTiebreak = false) {
    return { own, opponent, isMatchTiebreak };
}

const now = new Date("2026-10-30");

const matches = [
    {
        playedAt: new Date("2026-10-27"),
        won: true,
        sets: [set(6, 3), set(7, 5)],
    },
    {
        playedAt: new Date("2026-10-02"),
        won: true,
        sets: [set(4, 6), set(6, 3), set(10, 8, true)],
    },
    {
        playedAt: new Date("2026-09-20"),
        won: false,
        sets: [set(3, 6), set(1, 6)],
    },
    {
        playedAt: new Date("2025-10-12"),
        won: true,
        sets: [set(6, 4), set(3, 6), set(6, 2)],
    },
    {
        playedAt: new Date("2025-10-01"),
        won: true,
        sets: [set(6, 0), set(6, 1)],
    },
    {
        playedAt: new Date("2025-09-01"),
        won: true,
        sets: [set(7, 6), set(6, 4)],
    },
];

describe("getMatchStats", () => {
    it("counts matches won and lost", () => {
        expect(getMatchStats(matches).matches).toEqual({ won: 5, lost: 1 });
    });

    it("counts a match tiebreak as a set but not its points as games", () => {
        const stats = getMatchStats(matches);
        expect(stats.sets).toEqual({ won: 10, lost: 4 });
        expect(stats.matchTiebreaks).toEqual({ won: 1, lost: 0 });
        expect(stats.games).toEqual({ won: 67, lost: 52 });
    });
});

describe("winPercentage", () => {
    it("rounds to whole percent, null when nothing was played", () => {
        expect(winPercentage({ won: 2, lost: 1 })).toBe(67);
        expect(winPercentage({ won: 0, lost: 0 })).toBeNull();
    });
});

describe("isInStatsPeriod", () => {
    it("checks the calendar month or year of now, or any time", () => {
        const sameMonth = new Date("2026-10-01");
        const sameYear = new Date("2026-01-15");
        const lastYear = new Date("2025-10-15");
        expect(isInStatsPeriod(sameMonth, "month", now)).toBe(true);
        expect(isInStatsPeriod(sameYear, "month", now)).toBe(false);
        expect(isInStatsPeriod(lastYear, "month", now)).toBe(false);
        expect(isInStatsPeriod(sameYear, "year", now)).toBe(true);
        expect(isInStatsPeriod(lastYear, "year", now)).toBe(false);
        expect(isInStatsPeriod(lastYear, "all", now)).toBe(true);
    });
});
