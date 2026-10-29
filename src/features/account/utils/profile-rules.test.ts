import { describe, expect, it } from "vitest";
import {
    bioSchema,
    genderSchema,
    normalizeBio,
    profileFormSchema,
} from "@/features/account/utils/profile-rules";
import { validator } from "@/lib/form-validation";

const BIO_TOO_LONG = "Bio must be at most 160 characters";

describe("normalizeBio", () => {
    it.each([
        [
            "trims the text",
            "  Lefty, one-handed backhand \n",
            "Lefty, one-handed backhand",
        ],
        ["turns Windows line breaks into \\n", "a\r\nb", "a\nb"],
        ["turns old Mac line breaks into \\n", "a\rb", "a\nb"],
        ["keeps one empty line", "a\n\nb", "a\n\nb"],
        ["shortens more empty lines to one", "a\n\n\n\nb", "a\n\nb"],
        ["counts \\r\\n as one line break", "a\r\n\r\n\r\nb", "a\n\nb"],
    ])("%s", (_, value, bio) => {
        expect(normalizeBio(value)).toBe(bio);
    });

    it.each(["", "  \n\t "])("is null for an empty bio (%j)", (value) => {
        expect(normalizeBio(value)).toBeNull();
    });
});

describe("bioSchema", () => {
    const check = validator(bioSchema);

    it("returns the normalized bio", () => {
        expect(bioSchema.parse(" a\r\n\r\n\r\nb ")).toBe("a\n\nb");
        expect(bioSchema.parse("")).toBeNull();
    });

    it("counts the length after normalizing", () => {
        expect(check("a".repeat(160))).toBeNull();
        expect(check(`  ${"a".repeat(160)}\n\n`)).toBeNull();
        expect(check("a".repeat(161))).toBe(BIO_TOO_LONG);
    });

    it("refuses very long text before normalizing it", () => {
        expect(check(" ".repeat(641))).toBe(BIO_TOO_LONG);
    });
});

describe("genderSchema", () => {
    it.each(["FEMALE", "MALE", "OTHER"])("stores %s", (value) => {
        expect(genderSchema.parse(value)).toBe(value);
    });

    it.each([
        ["Prefer not to say", "PREFER_NOT_TO_SAY"],
        ["no value", null],
        ["a missing value", undefined],
    ])("stores no gender for %s", (_, value) => {
        expect(genderSchema.parse(value)).toBeNull();
    });

    it.each(["", "female", "UNKNOWN"])("refuses %j", (value) => {
        expect(validator(genderSchema)(value)).toBe("Choose a gender");
    });
});

describe("profileFormSchema", () => {
    it("returns the profile as stored", () => {
        expect(
            profileFormSchema.parse({
                name: " Anna ",
                bio: null,
                gender: null,
            }),
        ).toEqual({ name: "Anna", bio: null, gender: null });
    });
});
