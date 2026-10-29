import { describe, expect, it } from "vitest";
import {
    commentContentSchema,
    typedCommentSchema,
    withReplyMention,
} from "@/features/comments/utils/comment-rules";
import { validator } from "@/lib/form-validation";

const TOO_LONG = "Replies can be at most 160 characters";

describe("typedCommentSchema", () => {
    const check = validator(typedCommentSchema);

    it("trims the text", () => {
        expect(typedCommentSchema.parse("  nice  ")).toBe("nice");
    });

    it("allows an empty text, which can still get a reply mention", () => {
        expect(check("")).toBeNull();
    });

    it("counts the length after trimming", () => {
        expect(check(` ${"a".repeat(160)} `)).toBeNull();
        expect(check("a".repeat(161))).toBe(TOO_LONG);
    });
});

describe("commentContentSchema", () => {
    const check = validator(commentContentSchema);

    it("trims the text", () => {
        expect(commentContentSchema.parse("  nice  ")).toBe("nice");
    });

    it.each(["", "   "])("requires some text (%j)", (value) => {
        expect(check(value)).toBe("Write something first");
    });

    it("accepts up to 160 characters", () => {
        expect(check("a".repeat(160))).toBeNull();
        expect(check("a".repeat(161))).toBe(TOO_LONG);
    });
});

describe("withReplyMention", () => {
    it("puts the mention in front", () => {
        expect(withReplyMention("nice shot", "anna")).toBe("@anna nice shot");
    });

    it.each(["@anna nice shot", "@Anna nice shot", "@anna, nice", "@anna"])(
        "keeps %j, which already starts with the mention",
        (content) => {
            expect(withReplyMention(content, "anna")).toBe(content);
        },
    );

    it("adds the mention before a longer username", () => {
        expect(withReplyMention("@annabel hi", "anna")).toBe(
            "@anna @annabel hi",
        );
    });

    it("adds the mention when it's further in", () => {
        expect(withReplyMention("hi @anna", "anna")).toBe("@anna hi @anna");
    });
});
