import { describe, expect, it } from "vitest";
import { endsGroup, formatMessageTime, mergeMessages } from "./chat-thread";

function message(id: string, minute: number, isOwn = true) {
    return { id, createdAt: new Date(2026, 9, 31, 12, minute), isOwn };
}

describe("mergeMessages", () => {
    it("adds older and newer messages in order", () => {
        const current = [message("b", 2), message("c", 3)];
        expect(
            mergeMessages(current, [message("d", 4), message("a", 1)]).map(
                ({ id }) => id,
            ),
        ).toEqual(["a", "b", "c", "d"]);
    });

    it("shows a message once", () => {
        const current = [message("a", 1), message("b", 2)];
        expect(mergeMessages(current, [message("b", 2)])).toBe(current);
        expect(
            mergeMessages(current, [message("b", 2), message("c", 3)]),
        ).toHaveLength(3);
    });

    it("orders messages sent at the same time by id", () => {
        expect(
            mergeMessages([message("b", 1)], [message("a", 1)]).map(
                ({ id }) => id,
            ),
        ).toEqual(["a", "b"]);
    });
});

describe("endsGroup", () => {
    it("ends at the last message", () => {
        expect(endsGroup(message("a", 1), undefined)).toBe(true);
    });

    it("ends when the other user writes", () => {
        expect(endsGroup(message("a", 1), message("b", 2, false))).toBe(true);
    });

    it("ends after a pause", () => {
        expect(endsGroup(message("a", 1), message("b", 2))).toBe(false);
        expect(endsGroup(message("a", 1), message("b", 7))).toBe(true);
    });
});

describe("formatMessageTime", () => {
    const now = new Date(2026, 9, 31, 18, 0);

    it("shows only the time today", () => {
        expect(formatMessageTime(new Date(2026, 9, 31, 15, 42), now)).toBe(
            "3:42 PM",
        );
    });

    it("adds the day, and the year before this one", () => {
        expect(formatMessageTime(new Date(2026, 9, 12, 15, 42), now)).toBe(
            "Oct 12, 3:42 PM",
        );
        expect(formatMessageTime(new Date(2025, 9, 12, 15, 42), now)).toBe(
            "Oct 12, 2025, 3:42 PM",
        );
    });
});
