import { describe, expect, it } from "vitest";
import { getSafeRedirect } from "@/features/auth/utils/redirect";

describe("getSafeRedirect", () => {
    it.each([
        "/",
        "/matches",
        "/profile/anna/followers",
        "/post/42?reply=7#comments",
        `/${"a".repeat(2047)}`,
    ])("keeps the path %s", (path) => {
        expect(getSafeRedirect(path)).toBe(path);
    });

    it.each([
        ["missing", null],
        ["not text", 42],
        ["empty", ""],
        ["relative", "matches"],
        ["another site", "https://evil.com"],
        ["protocol-relative", "//evil.com"],
        ["a backslash host", "/\\evil.com"],
        ["the sign-in page", "/sign-in"],
        ["the sign-up page with a query", "/sign-up?redirectTo=/matches"],
        ["longer than 2048 characters", `/${"a".repeat(2048)}`],
    ])("goes home when the path is %s", (_, value) => {
        expect(getSafeRedirect(value)).toBe("/");
    });

    // Browsers drop tabs and line breaks from URLs, which turns the first
    // three into "//evil.com"
    it.each(["/\t/evil.com", "/\n/evil.com", "/\r/evil.com", "/matches\0"])(
        "goes home when the path %j has a control character",
        (value) => {
            expect(getSafeRedirect(value)).toBe("/");
        },
    );
});
