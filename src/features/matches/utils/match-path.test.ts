import { describe, expect, it } from "vitest";
import {
    addMatchPath,
    editMatchPath,
    matchPath,
} from "@/features/matches/utils/match-path";

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

describe("matchPath", () => {
    it("is the match's own page", () => {
        expect(matchPath("m1")).toBe("/matches/m1");
    });
});

describe("editMatchPath", () => {
    it("is the match's edit form", () => {
        expect(editMatchPath("m1")).toBe("/matches/m1/edit");
    });
});
