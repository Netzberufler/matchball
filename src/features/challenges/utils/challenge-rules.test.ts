import { describe, expect, it } from "vitest";
import {
    challengePair,
    challengeState,
    checkDeadline,
    cooldownEnd,
    cooldownStart,
    DEADLINE_TOO_LATE_MESSAGE,
    DEADLINE_TOO_SOON_MESSAGE,
    formatWaitTime,
} from "./challenge-rules";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = new Date("2026-11-01T12:00:00Z");
const inMs = (ms: number) => new Date(now.getTime() + ms);

describe("checkDeadline", () => {
    it("allows deadlines from two days to 60 days away", () => {
        expect(checkDeadline(inMs(2 * DAY), now)).toBeNull();
        expect(checkDeadline(inMs(7 * DAY), now)).toBeNull();
        expect(checkDeadline(inMs(60 * DAY), now)).toBeNull();
    });

    it("allows a little less than two days, for the time in the popup", () => {
        expect(checkDeadline(inMs(2 * DAY - 10 * 60 * 1000), now)).toBeNull();
    });

    it("refuses sooner and later deadlines", () => {
        expect(checkDeadline(inMs(DAY), now)).toBe(DEADLINE_TOO_SOON_MESSAGE);
        expect(checkDeadline(inMs(-DAY), now)).toBe(DEADLINE_TOO_SOON_MESSAGE);
        expect(checkDeadline(inMs(61 * DAY), now)).toBe(
            DEADLINE_TOO_LATE_MESSAGE,
        );
    });
});

describe("cooldown", () => {
    it("lasts three days", () => {
        expect(cooldownStart(now)).toEqual(inMs(-3 * DAY));
        expect(cooldownEnd(now)).toEqual(inMs(3 * DAY));
    });
});

describe("formatWaitTime", () => {
    it("rounds days and hours up", () => {
        expect(formatWaitTime(inMs(2 * DAY + HOUR), now)).toBe("in 3 days");
        expect(formatWaitTime(inMs(DAY), now)).toBe("in 1 day");
        expect(formatWaitTime(inMs(5 * HOUR - 1), now)).toBe("in 5 hours");
        expect(formatWaitTime(inMs(60 * 1000), now)).toBe("in 1 hour");
        expect(formatWaitTime(inMs(-HOUR), now)).toBe("in 1 hour");
    });
});

describe("challengePair", () => {
    it("is the same whoever challenges whom", () => {
        const a = "0190a000-0000-7000-8000-000000000001";
        const b = "0190a000-0000-7000-8000-000000000002";
        expect(challengePair(a, b)).toBe(`${a}:${b}`);
        expect(challengePair(b, a)).toBe(`${a}:${b}`);
    });
});

describe("challengeState", () => {
    it("shows open challenges past their deadline as expired", () => {
        expect(challengeState("OPEN", inMs(HOUR), now)).toBe("open");
        expect(challengeState("OPEN", now, now)).toBe("expired");
        expect(challengeState("EXPIRED", inMs(-HOUR), now)).toBe("expired");
    });

    it("keeps the other statuses, whatever the deadline", () => {
        expect(challengeState("ACCEPTED", inMs(-DAY), now)).toBe("accepted");
        expect(challengeState("PLAYED", inMs(-DAY), now)).toBe("played");
        expect(challengeState("DECLINED", inMs(DAY), now)).toBe("declined");
    });
});
