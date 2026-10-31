import { describe, expect, it } from "vitest";
import {
    escapeLike,
    normalizeSearchQuery,
    SEARCH_QUERY_MAX_LENGTH,
    searchQuerySchema,
    searchTerms,
} from "@/features/search/utils/search-query";

describe("normalizeSearchQuery", () => {
    it("trims and collapses whitespace", () => {
        expect(normalizeSearchQuery("  great \t  match \n")).toBe(
            "great match",
        );
    });

    it("is empty for missing or too short queries", () => {
        expect(normalizeSearchQuery(undefined)).toBe("");
        expect(normalizeSearchQuery(null)).toBe("");
        expect(normalizeSearchQuery("   ")).toBe("");
        expect(normalizeSearchQuery(" a ")).toBe("");
    });

    it("uses the first of several values", () => {
        expect(normalizeSearchQuery(["tom", "anna"])).toBe("tom");
    });

    it("cuts long queries", () => {
        const query = normalizeSearchQuery("a".repeat(500));
        expect(query).toHaveLength(SEARCH_QUERY_MAX_LENGTH);
    });
});

describe("searchQuerySchema", () => {
    it("accepts normalized queries", () => {
        expect(searchQuerySchema.safeParse("great match").success).toBe(true);
    });

    it("rejects anything else", () => {
        for (const input of ["", "a", " tom", "a  b", 1, null]) {
            expect(searchQuerySchema.safeParse(input).success).toBe(false);
        }
    });
});

describe("searchTerms", () => {
    it("splits a query into distinct words", () => {
        expect(searchTerms("tom great tom")).toEqual(["tom", "great"]);
    });

    it("keeps only the first five words", () => {
        expect(searchTerms("a b c d e f g")).toEqual(["a", "b", "c", "d", "e"]);
    });
});

describe("escapeLike", () => {
    it("escapes LIKE wildcards and backslashes", () => {
        expect(escapeLike("100%_\\x")).toBe("100\\%\\_\\\\x");
    });

    it("leaves other text alone", () => {
        expect(escapeLike("Tom @anna")).toBe("Tom @anna");
    });
});
