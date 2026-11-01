import { describe, expect, it } from "vitest";
import {
    challengeFiltersKey,
    countActiveChallengeFilters,
    NO_CHALLENGE_FILTERS,
} from "./challenge-filters";

describe("challengeFiltersKey", () => {
    it("is the same whatever order the filters were ticked in", () => {
        expect(
            challengeFiltersKey({
                statuses: ["won", "open"],
                opponentIds: ["b", "a"],
            }),
        ).toBe(
            challengeFiltersKey({
                statuses: ["open", "won"],
                opponentIds: ["a", "b"],
            }),
        );
    });

    it("tells different filters apart", () => {
        expect(challengeFiltersKey(NO_CHALLENGE_FILTERS)).not.toBe(
            challengeFiltersKey({ statuses: ["open"], opponentIds: [] }),
        );
    });
});

describe("countActiveChallengeFilters", () => {
    it("counts each status and opponent", () => {
        expect(countActiveChallengeFilters(NO_CHALLENGE_FILTERS)).toBe(0);
        expect(
            countActiveChallengeFilters({
                statuses: ["open", "lost"],
                opponentIds: ["a"],
            }),
        ).toBe(3);
    });
});
