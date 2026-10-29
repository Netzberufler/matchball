import { describe, expect, it } from "vitest";
import {
    formatFullPostDate,
    formatPostDate,
} from "@/features/posts/utils/format-post-date";

// The tests run in UTC (see vitest.config.mts)
const NOW = new Date("2026-10-29T15:00:00Z");

// The time `ms` milliseconds before NOW
function ago(ms: number) {
    return new Date(NOW.getTime() - ms);
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

describe("formatPostDate", () => {
    it.each([
        ["now", 0, "now"],
        ["59 seconds ago", 59 * SECOND, "now"],
        ["a minute ago", MINUTE, "1m"],
        ["59 minutes ago", 59 * MINUTE + 59 * SECOND, "59m"],
        ["an hour ago", HOUR, "1h"],
        ["23 hours ago", 23 * HOUR + 59 * MINUTE, "23h"],
        ["a day ago", 24 * HOUR, "Oct 28"],
    ])("shows %s as %j", (_, elapsed, expected) => {
        expect(formatPostDate(ago(elapsed), NOW)).toBe(expected);
    });

    it("shows a time in the future as now", () => {
        expect(formatPostDate(ago(-5 * MINUTE), NOW)).toBe("now");
    });

    it("leaves out this year", () => {
        expect(formatPostDate(new Date("2026-01-01T00:00:00Z"), NOW)).toBe(
            "Jan 1",
        );
    });

    it("shows the year of earlier years", () => {
        expect(formatPostDate(new Date("2025-12-31T23:59:00Z"), NOW)).toBe(
            "Dec 31, 2025",
        );
    });

    it("compares with the current time by default", () => {
        expect(formatPostDate(new Date())).toBe("now");
    });
});

describe("formatFullPostDate", () => {
    it("shows the date and time", () => {
        expect(formatFullPostDate(new Date("2026-10-18T15:42:00Z"))).toBe(
            "October 18, 2026 at 3:42 PM",
        );
    });
});
