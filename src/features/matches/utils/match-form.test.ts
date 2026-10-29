import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    type MatchFormError,
    parseEditMatchForm,
    parseMatchForm,
    scoreField,
    toMatchFormError,
} from "@/features/matches/utils/match-form";

const OPPONENT_ID = "3f2a6c1e-8b4d-4e7a-9c2f-1d5e6b7a8c9d";

// The add match form's data for a 6:3 6:4 win on Oct 12, 2026, with
// `fields` set on top. A null field is left out, as if it wasn't sent.
function matchFormData(fields: Record<string, string | Blob | null> = {}) {
    const values: Record<string, string | Blob | null> = {
        playedAt: "2026-10-12",
        opponentId: OPPONENT_ID,
        set1Own: "6",
        set1Opponent: "3",
        set2Own: "6",
        set2Opponent: "4",
        set3Own: "",
        set3Opponent: "",
        ...fields,
    };
    const formData = new FormData();
    for (const [name, value] of Object.entries(values)) {
        if (value !== null) {
            formData.set(name, value);
        }
    }
    return formData;
}

// The form's error for `formData`, which must be refused
function formError(formData: FormData): MatchFormError {
    const result = parseMatchForm(formData);
    if (result.success) {
        throw new Error("Expected the form data to be refused");
    }
    return toMatchFormError(result.error);
}

const PLAYED_AT_ERROR = {
    field: "playedAt",
    message: "Choose the day you played, today or earlier",
};

const OPPONENT_ERROR = {
    field: "opponentId",
    message: "Choose your opponent",
};

function scoreError(set: 1 | 2 | 3, message = "Scores are whole numbers") {
    return { field: "score", set, message };
}

beforeEach(() => {
    vi.useFakeTimers();
    // Thursday afternoon in UTC
    vi.setSystemTime(new Date("2026-10-29T15:00:00Z"));
});

afterEach(() => {
    vi.useRealTimers();
});

describe("scoreField", () => {
    it("names a set's score field", () => {
        expect(scoreField(1, "own")).toBe("set1Own");
        expect(scoreField(3, "opponent")).toBe("set3Opponent");
    });
});

describe("parseMatchForm", () => {
    it("returns the day, opponent and score with the user as player 1", () => {
        const result = parseMatchForm(matchFormData());
        expect(result.success && result.data).toEqual({
            playedAt: new Date("2026-10-12T00:00:00Z"),
            opponentId: OPPONENT_ID,
            score: {
                set1Player1: 6,
                set1Player2: 3,
                set2Player1: 6,
                set2Player2: 4,
                set3Player1: null,
                set3Player2: null,
                set3IsMatchTiebreak: false,
            },
        });
    });

    it("returns a match tiebreak in the third set", () => {
        const result = parseMatchForm(
            matchFormData({
                set2Own: "4",
                set2Opponent: "6",
                set3Own: "10",
                set3Opponent: "7",
            }),
        );
        expect(result.success && result.data.score).toMatchObject({
            set3Player1: 10,
            set3Player2: 7,
            set3IsMatchTiebreak: true,
        });
    });

    it("ignores fields the form doesn't send", () => {
        const formData = matchFormData();
        formData.set("player1Id", "someone-else");
        const result = parseMatchForm(formData);
        expect(result.success && Object.keys(result.data)).toEqual([
            "playedAt",
            "opponentId",
            "score",
        ]);
    });

    it("treats missing score fields as empty", () => {
        expect(
            parseMatchForm(matchFormData({ set3Own: null, set3Opponent: null }))
                .success,
        ).toBe(true);
    });
});

describe("parseEditMatchForm", () => {
    it("returns the day and score without an opponent", () => {
        const result = parseEditMatchForm(matchFormData({ opponentId: null }));
        expect(result.success && result.data).toEqual({
            playedAt: new Date("2026-10-12T00:00:00Z"),
            score: {
                set1Player1: 6,
                set1Player2: 3,
                set2Player1: 6,
                set2Player2: 4,
                set3Player1: null,
                set3Player2: null,
                set3IsMatchTiebreak: false,
            },
        });
    });

    it("ignores an opponent that's sent along", () => {
        const result = parseEditMatchForm(
            matchFormData({ opponentId: "not-a-user-id" }),
        );
        expect(result.success && result.data).not.toHaveProperty("opponentId");
    });

    it("checks the date and score like the add form", () => {
        const dateResult = parseEditMatchForm(
            matchFormData({ playedAt: "2026-11-30" }),
        );
        expect(
            !dateResult.success && toMatchFormError(dateResult.error),
        ).toEqual(PLAYED_AT_ERROR);
        const scoreResult = parseEditMatchForm(
            matchFormData({ set2Own: "6", set2Opponent: "6" }),
        );
        expect(
            !scoreResult.success && toMatchFormError(scoreResult.error),
        ).toMatchObject({ field: "score", set: 2 });
    });
});

describe("the day played", () => {
    it.each([
        ["today", "2026-10-29"],
        ["tomorrow in UTC, already today east of UTC", "2026-10-30"],
        ["the earliest day", "1900-01-01"],
        ["a leap day", "2024-02-29"],
    ])("accepts %s", (_, playedAt) => {
        expect(parseMatchForm(matchFormData({ playedAt })).success).toBe(true);
    });

    it.each([
        ["empty", ""],
        ["missing", null],
        ["the day after tomorrow", "2026-10-31"],
        ["before 1900", "1899-12-31"],
        ["not a real day", "2026-02-30"],
        ["not a leap day", "2026-02-29"],
        ["a month 13", "2026-13-01"],
        ["in another format", "12.10.2026"],
        ["with a time", "2026-10-12T10:00"],
    ])("refuses a day that is %s", (_, playedAt) => {
        expect(formError(matchFormData({ playedAt }))).toEqual(PLAYED_AT_ERROR);
    });

    it("allows tomorrow by UTC, not by the local time zone", () => {
        vi.setSystemTime(new Date("2026-10-29T23:30:00Z"));
        expect(
            parseMatchForm(matchFormData({ playedAt: "2026-10-30" })).success,
        ).toBe(true);
        expect(formError(matchFormData({ playedAt: "2026-10-31" }))).toEqual(
            PLAYED_AT_ERROR,
        );
    });
});

describe("the opponent", () => {
    it.each([
        ["empty", ""],
        ["missing", null],
        ["not a user id", "nadal"],
        ["too long", `${OPPONENT_ID}0`],
    ])("is refused when %s", (_, opponentId) => {
        expect(formError(matchFormData({ opponentId }))).toEqual(
            OPPONENT_ERROR,
        );
    });
});

describe("the score fields", () => {
    it.each([
        ["text", "six"],
        ["a decimal", "6.5"],
        ["negative", "-1"],
        ["padded", " 6"],
        ["longer than 3 digits", "1000"],
    ])("refuse %s", (_, value) => {
        expect(formError(matchFormData({ set2Opponent: value }))).toEqual(
            scoreError(2),
        );
    });

    it("refuse a file", () => {
        expect(formError(matchFormData({ set3Own: new Blob(["6"]) }))).toEqual(
            scoreError(3),
        );
    });

    it("report the set the tennis rules refuse", () => {
        expect(
            formError(matchFormData({ set1Own: "6", set1Opponent: "5" })),
        ).toEqual(scoreError(1, "A set ends 6:0 to 6:4, 7:5 or 7:6"));
        expect(
            formError(matchFormData({ set3Own: "6", set3Opponent: "2" })),
        ).toEqual(
            scoreError(
                3,
                "The first two sets decided the match, so leave set 3 empty",
            ),
        );
    });

    it("are checked after the day and the opponent", () => {
        expect(
            formError(matchFormData({ playedAt: "", set1Own: "six" })),
        ).toEqual(PLAYED_AT_ERROR);
        expect(
            formError(matchFormData({ opponentId: "", set1Own: "six" })),
        ).toEqual(OPPONENT_ERROR);
    });
});
