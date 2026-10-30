import { describe, expect, it } from "vitest";
import { addMatchPath } from "@/features/matches/utils/match-path";

describe("addMatchPath", () => {
    it("is the plain form without an opponent", () => {
        expect(addMatchPath()).toBe("/matches/add");
    });

    it("names the opponent by username", () => {
        expect(addMatchPath("jonas_topspin")).toBe(
            "/matches/add?opponent=jonas_topspin",
        );
    });
});
