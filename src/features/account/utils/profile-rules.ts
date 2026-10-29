// Shared by the profile form and the updateProfile action
import * as z from "zod/mini";
import { nameSchema } from "@/features/auth/utils/auth-rules";
import { formText } from "@/lib/form-validation";

// Also the column size in schema.prisma
export const BIO_MAX_LENGTH = 160;

// Trimmed, with Windows line breaks as \n and at most one empty line in a
// row; null when empty, so profiles without a bio show none
export function normalizeBio(value: string) {
    const bio = value
        .replace(/\r\n?/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    return bio || null;
}

// Stands for no gender (null in the database) in the select, which needs a
// value for every option
export const GENDER_NOT_SAID = "PREFER_NOT_TO_SAY";

// The Gender enum's values in schema.prisma, with their labels, then the
// option for no gender
export const GENDER_OPTIONS = [
    { value: "FEMALE", label: "Female" },
    { value: "MALE", label: "Male" },
    { value: "OTHER", label: "Other" },
    { value: GENDER_NOT_SAID, label: "Prefer not to say" },
] as const;

export type Gender = Exclude<
    (typeof GENDER_OPTIONS)[number]["value"],
    typeof GENDER_NOT_SAID
>;

const BIO_TOO_LONG = `Bio must be at most ${BIO_MAX_LENGTH} characters`;

// The bio as stored (see normalizeBio): at most BIO_MAX_LENGTH characters
// after normalizing. Overlong text is refused before it's normalized.
export const bioSchema = z.pipe(
    z.pipe(
        z
            .string(BIO_TOO_LONG)
            .check(z.maxLength(BIO_MAX_LENGTH * 4, BIO_TOO_LONG)),
        z.transform(normalizeBio),
    ),
    z.nullable(z.string().check(z.maxLength(BIO_MAX_LENGTH, BIO_TOO_LONG))),
);

// The gender to store for the select's value: one of the Gender enum's
// values, or null for "Prefer not to say" or no value. Anything else is
// refused.
export const genderSchema = z.pipe(
    z.pipe(
        z.transform((value: unknown): unknown => value ?? GENDER_NOT_SAID),
        z.enum(
            GENDER_OPTIONS.map((option) => option.value),
            "Choose a gender",
        ),
    ),
    z.transform((value): Gender | null =>
        value === GENDER_NOT_SAID ? null : value,
    ),
);

export const PROFILE_FIELDS = ["name", "bio", "gender"];

export const profileFormSchema = z.object({
    name: formText(nameSchema),
    bio: formText(bioSchema),
    gender: genderSchema,
});
