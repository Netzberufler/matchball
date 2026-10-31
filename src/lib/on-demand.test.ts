import { describe, expect, it } from "vitest";
import { initialEntries, refreshEntries } from "@/lib/on-demand";

const loaded = (data: string) => ({ data, isOld: false, failed: false });
const join = (current: string, latest: string) => `${current}+${latest}`;

describe("initialEntries", () => {
    it("makes loaded entries of what the server sent", () => {
        expect(initialEntries({ all: "a" })).toEqual({ all: loaded("a") });
    });
});

describe("refreshEntries", () => {
    it("merges what the server sent again into what's shown", () => {
        expect(
            refreshEntries({ all: loaded("old") }, { all: "new" }, join),
        ).toEqual({ all: loaded("old+new") });
    });

    it("marks everything else loaded as old, keeping its data", () => {
        expect(
            refreshEntries({ all: loaded("a"), likes: loaded("l") }, {}, join),
        ).toEqual({
            all: { data: "a", isOld: true, failed: false },
            likes: { data: "l", isOld: true, failed: false },
        });
    });

    it("leaves entries without data as they are", () => {
        const failed = { data: null, isOld: false, failed: true };
        expect(refreshEntries({ likes: failed }, {}, join)).toEqual({
            likes: failed,
        });
    });

    it("takes what the server sent when nothing was shown", () => {
        const failed = { data: null, isOld: false, failed: true };
        expect(refreshEntries({ all: failed }, { all: "a" }, join)).toEqual({
            all: loaded("a"),
        });
    });
});
