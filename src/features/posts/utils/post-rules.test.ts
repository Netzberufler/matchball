import { describe, expect, it } from "vitest";
import { postContentSchema } from "@/features/posts/utils/post-rules";
import { validator } from "@/lib/form-validation";

describe("postContentSchema", () => {
    const check = validator(postContentSchema);

    it("trims the text", () => {
        expect(postContentSchema.parse("  Won 6:3 6:4!\n")).toBe(
            "Won 6:3 6:4!",
        );
    });

    it.each(["", " \n "])("requires some text (%j)", (value) => {
        expect(check(value)).toBe("Write something first");
    });

    it("accepts up to 160 characters after trimming", () => {
        expect(check(` ${"a".repeat(160)} `)).toBeNull();
        expect(check("a".repeat(161))).toBe(
            "Posts can be at most 160 characters",
        );
    });
});
