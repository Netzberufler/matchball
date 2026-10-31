import { describe, expect, it } from "vitest";
import {
    conversationPair,
    MESSAGE_MAX_LENGTH,
    messageContentSchema,
} from "./message-rules";

describe("conversationPair", () => {
    it("puts the smaller id first, whoever writes", () => {
        const a = "0190a000-0000-7000-8000-000000000001";
        const b = "0190a000-0000-7000-8000-000000000002";
        expect(conversationPair(a, b)).toEqual({ user1Id: a, user2Id: b });
        expect(conversationPair(b, a)).toEqual({ user1Id: a, user2Id: b });
    });
});

describe("messageContentSchema", () => {
    it("trims the text", () => {
        expect(messageContentSchema.parse("  hi \n")).toBe("hi");
    });

    it("refuses empty and too long messages", () => {
        expect(messageContentSchema.safeParse("   ").success).toBe(false);
        expect(
            messageContentSchema.safeParse("a".repeat(MESSAGE_MAX_LENGTH + 1))
                .success,
        ).toBe(false);
        expect(
            messageContentSchema.safeParse("a".repeat(MESSAGE_MAX_LENGTH))
                .success,
        ).toBe(true);
    });
});
