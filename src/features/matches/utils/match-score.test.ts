import { describe, expect, it } from "vitest";
import {
    areFirstSetsSplit,
    type EnteredSet,
    formatPlayedAt,
    formatPlayedAtParts,
    formatSet,
    getScoreWinner,
    getSets,
    isSameScore,
    type MatchScore,
    parseEnteredScore,
    scoreMax,
    WON_SET_SCORES,
} from "@/features/matches/utils/match-score";

// A MatchScore from sets written as [player1, player2], e.g.
// score([6, 3], [4, 6], [10, 8], true)
function score(
    set1: [number, number],
    set2: [number, number],
    set3: [number, number] | null = null,
    set3IsMatchTiebreak = false,
): MatchScore {
    return {
        set1Player1: set1[0],
        set1Player2: set1[1],
        set2Player1: set2[0],
        set2Player2: set2[1],
        set3Player1: set3?.[0] ?? null,
        set3Player2: set3?.[1] ?? null,
        set3IsMatchTiebreak,
    };
}

// An entered set from [own, opponent], with null for an empty field
function entered([own, opponent]: [number | null, number | null]): EnteredSet {
    return { own, opponent };
}

// The three entered sets, with set 3 empty unless given
function enteredSets(
    set1: [number | null, number | null],
    set2: [number | null, number | null],
    set3: [number | null, number | null] = [null, null],
): [EnteredSet, EnteredSet, EnteredSet] {
    return [entered(set1), entered(set2), entered(set3)];
}

// Regular set scores that don't finish a set, as [a, b]
const UNFINISHED_SET_SCORES = [
    [0, 0],
    [5, 3],
    [6, 5],
    [6, 6],
    [7, 4],
    [7, 7],
] as const;

describe("getSets", () => {
    it("returns the first two sets from player 1's side", () => {
        expect(getSets(score([6, 3], [7, 5]), "player1")).toEqual([
            { own: 6, opponent: 3, isMatchTiebreak: false },
            { own: 7, opponent: 5, isMatchTiebreak: false },
        ]);
    });

    it("swaps own and opponent for player 2", () => {
        expect(getSets(score([6, 3], [7, 5]), "player2")).toEqual([
            { own: 3, opponent: 6, isMatchTiebreak: false },
            { own: 5, opponent: 7, isMatchTiebreak: false },
        ]);
    });

    it("includes a third set with its match tiebreak flag", () => {
        expect(
            getSets(score([6, 3], [4, 6], [10, 8], true), "player2")[2],
        ).toEqual({ own: 8, opponent: 10, isMatchTiebreak: true });
    });

    it("leaves out a third set with a missing score", () => {
        const sets = getSets(
            { ...score([6, 3], [4, 6]), set3Player1: 6 },
            "player1",
        );
        expect(sets).toHaveLength(2);
    });
});

describe("isSameScore", () => {
    it("matches the same score from the same side", () => {
        const a = score([6, 3], [4, 6], [10, 8], true);
        expect(isSameScore(a, "player1", { ...a }, "player1")).toBe(true);
    });

    it("matches a score entered from the other side", () => {
        expect(
            isSameScore(
                score([6, 3], [4, 6], [10, 8], true),
                "player2",
                score([3, 6], [6, 4], [8, 10], true),
                "player1",
            ),
        ).toBe(true);
    });

    it("tells apart a changed set", () => {
        expect(
            isSameScore(
                score([6, 3], [6, 4]),
                "player1",
                score([6, 3], [6, 2]),
                "player1",
            ),
        ).toBe(false);
    });

    it("tells apart the same games from the other side", () => {
        expect(
            isSameScore(
                score([6, 3], [6, 4]),
                "player1",
                score([6, 3], [6, 4]),
                "player2",
            ),
        ).toBe(false);
    });

    it("tells apart a third set and a match tiebreak", () => {
        expect(
            isSameScore(
                score([6, 3], [4, 6], [7, 5]),
                "player1",
                score([6, 3], [4, 6], [10, 8], true),
                "player1",
            ),
        ).toBe(false);
        expect(
            isSameScore(
                score([6, 3], [6, 4]),
                "player1",
                score([6, 3], [4, 6], [6, 4]),
                "player1",
            ),
        ).toBe(false);
    });
});

describe("getScoreWinner", () => {
    it("is the player who won both sets", () => {
        expect(getScoreWinner(score([6, 3], [6, 4]))).toBe("player1");
        expect(getScoreWinner(score([3, 6], [5, 7]))).toBe("player2");
    });

    it.each(WON_SET_SCORES)("accepts a %i:%i set either way round", (a, b) => {
        expect(getScoreWinner(score([a, b], [a, b]))).toBe("player1");
        expect(getScoreWinner(score([b, a], [b, a]))).toBe("player2");
    });

    it.each(UNFINISHED_SET_SCORES)("is null with a %i:%i set", (a, b) => {
        expect(getScoreWinner(score([a, b], [6, 0]))).toBeNull();
        expect(getScoreWinner(score([6, 0], [a, b]))).toBeNull();
    });

    it("is the winner of a regular third set after split sets", () => {
        expect(getScoreWinner(score([6, 3], [4, 6], [7, 6]))).toBe("player1");
        expect(getScoreWinner(score([6, 3], [4, 6], [2, 6]))).toBe("player2");
    });

    it("is the winner of a match tiebreak after split sets", () => {
        expect(getScoreWinner(score([3, 6], [6, 4], [10, 8], true))).toBe(
            "player1",
        );
        expect(getScoreWinner(score([3, 6], [6, 4], [10, 12], true))).toBe(
            "player2",
        );
    });

    it("is null when split sets have no third set", () => {
        expect(getScoreWinner(score([6, 3], [4, 6]))).toBeNull();
    });

    it("is null with a third set after straight sets", () => {
        expect(getScoreWinner(score([6, 3], [6, 4], [6, 2]))).toBeNull();
    });

    it("is null with a match tiebreak flag after straight sets", () => {
        expect(getScoreWinner(score([6, 3], [6, 4], null, true))).toBeNull();
    });

    it("is null with an unfinished third set", () => {
        expect(getScoreWinner(score([6, 3], [4, 6], [6, 5]))).toBeNull();
    });

    it.each([
        [10, 9],
        [11, 10],
        [9, 7],
        [6, 3],
    ])("is null with a %i:%i match tiebreak", (a, b) => {
        expect(getScoreWinner(score([6, 3], [4, 6], [a, b], true))).toBeNull();
    });
});

describe("scoreMax", () => {
    it("is games for the first two sets and points for the third", () => {
        expect(scoreMax(1)).toBe(7);
        expect(scoreMax(2)).toBe(7);
        expect(scoreMax(3)).toBe(99);
    });
});

describe("areFirstSetsSplit", () => {
    it("is true when each player won one set", () => {
        expect(areFirstSetsSplit(enteredSets([6, 3], [4, 6]))).toBe(true);
        expect(areFirstSetsSplit(enteredSets([3, 6], [6, 4]))).toBe(true);
    });

    it("is false when one player won both sets", () => {
        expect(areFirstSetsSplit(enteredSets([6, 3], [6, 4]))).toBe(false);
    });

    it("is false while a set is incomplete", () => {
        expect(areFirstSetsSplit(enteredSets([6, 3], [4, null]))).toBe(false);
        expect(areFirstSetsSplit(enteredSets([null, null], [4, 6]))).toBe(
            false,
        );
    });

    it("is false while a set is level", () => {
        expect(areFirstSetsSplit(enteredSets([6, 3], [5, 5]))).toBe(false);
    });

    it("is false without two sets", () => {
        expect(areFirstSetsSplit([entered([6, 3])])).toBe(false);
    });
});

describe("parseEnteredScore", () => {
    it("returns straight sets with the entering player as player 1", () => {
        expect(parseEnteredScore(enteredSets([6, 3], [7, 5]))).toEqual({
            score: score([6, 3], [7, 5]),
        });
        expect(parseEnteredScore(enteredSets([3, 6], [5, 7]))).toEqual({
            score: score([3, 6], [5, 7]),
        });
    });

    it("returns a regular third set", () => {
        expect(parseEnteredScore(enteredSets([6, 3], [4, 6], [7, 5]))).toEqual({
            score: score([6, 3], [4, 6], [7, 5]),
        });
    });

    it("treats a third set where someone reached 10 as a match tiebreak", () => {
        expect(parseEnteredScore(enteredSets([6, 3], [4, 6], [8, 10]))).toEqual(
            { score: score([6, 3], [4, 6], [8, 10], true) },
        );
        expect(
            parseEnteredScore(enteredSets([6, 3], [4, 6], [14, 12])),
        ).toEqual({ score: score([6, 3], [4, 6], [14, 12], true) });
    });

    it("refuses more than 7 games in the first two sets", () => {
        expect(parseEnteredScore(enteredSets([8, 6], [6, 3]))).toEqual({
            error: { set: 1, message: "A set has at most 7 games" },
        });
        expect(parseEnteredScore(enteredSets([6, 3], [3, 8]))).toEqual({
            error: { set: 2, message: "A set has at most 7 games" },
        });
    });

    it("refuses more than 99 points in the third set", () => {
        expect(
            parseEnteredScore(enteredSets([6, 3], [4, 6], [100, 98])),
        ).toEqual({ error: { set: 3, message: "Scores go up to 99" } });
    });

    it("asks for both scores of a set", () => {
        expect(parseEnteredScore(enteredSets([6, 3], [6, null]))).toEqual({
            error: { set: 2, message: "Enter both scores of set 2" },
        });
        expect(
            parseEnteredScore(enteredSets([6, 3], [4, 6], [null, 6])),
        ).toEqual({ error: { set: 3, message: "Enter both scores of set 3" } });
    });

    it("asks for the score of an empty first or second set", () => {
        expect(parseEnteredScore(enteredSets([null, null], [6, 3]))).toEqual({
            error: { set: 1, message: "Enter the score of set 1" },
        });
        expect(parseEnteredScore(enteredSets([6, 3], [null, null]))).toEqual({
            error: { set: 2, message: "Enter the score of set 2" },
        });
    });

    it.each(UNFINISHED_SET_SCORES)("refuses a %i:%i set", (a, b) => {
        expect(parseEnteredScore(enteredSets([a, b], [6, 3]))).toEqual({
            error: { set: 1, message: "A set ends 6:0 to 6:4, 7:5 or 7:6" },
        });
    });

    it("reports the first set with an error", () => {
        expect(parseEnteredScore(enteredSets([6, 5], [8, 6]))).toEqual({
            error: { set: 1, message: "A set ends 6:0 to 6:4, 7:5 or 7:6" },
        });
    });

    it("refuses a third set after straight sets", () => {
        expect(parseEnteredScore(enteredSets([6, 3], [6, 4], [6, 2]))).toEqual({
            error: {
                set: 3,
                message:
                    "The first two sets decided the match, so leave set 3 empty",
            },
        });
    });

    it("asks for a third set after split sets", () => {
        expect(parseEnteredScore(enteredSets([6, 3], [4, 6]))).toEqual({
            error: {
                set: 3,
                message: "The first two sets were split, so enter set 3",
            },
        });
    });

    it.each([
        [10, 9],
        [11, 10],
        [12, 9],
    ])("refuses a %i:%i match tiebreak", (a, b) => {
        expect(parseEnteredScore(enteredSets([6, 3], [4, 6], [a, b]))).toEqual({
            error: {
                set: 3,
                message:
                    "A match tiebreak ends 10:0 to 10:8, or two points apart after 9:9, e.g. 11:9",
            },
        });
    });

    // A score below 10 is read as a regular set, so 9:7 isn't an
    // unfinished match tiebreak
    it.each([
        [6, 5],
        [9, 7],
    ])("refuses a regular %i:%i third set", (a, b) => {
        expect(parseEnteredScore(enteredSets([6, 3], [4, 6], [a, b]))).toEqual({
            error: {
                set: 3,
                message:
                    "Set 3 ends 6:0 to 6:4, 7:5 or 7:6, or is a match tiebreak to 10",
            },
        });
    });
});

describe("formatSet", () => {
    it("shows own and opponent's score", () => {
        expect(formatSet({ own: 6, opponent: 3, isMatchTiebreak: false })).toBe(
            "6:3",
        );
        expect(formatSet({ own: 10, opponent: 8, isMatchTiebreak: true })).toBe(
            "10:8",
        );
    });
});

describe("formatPlayedAt", () => {
    it("shows the date of midnight UTC", () => {
        expect(formatPlayedAt(new Date("2026-10-12T00:00:00Z"))).toBe(
            "Oct 12, 2026",
        );
    });
});

describe("formatPlayedAtParts", () => {
    it("shows the day and the year apart", () => {
        expect(formatPlayedAtParts(new Date("2026-01-01T00:00:00Z"))).toEqual({
            day: "Jan 1",
            year: "2026",
        });
    });
});
