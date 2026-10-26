// Shared by the profile form and the updateProfile action

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

// The gender to store for a submitted select value: null for "Prefer not to
// say" or no value, undefined for anything that isn't an option
export function parseGender(value: unknown): Gender | null | undefined {
    if (value === null || value === GENDER_NOT_SAID) {
        return null;
    }
    const option = GENDER_OPTIONS.find((option) => option.value === value);
    return option && option.value !== GENDER_NOT_SAID
        ? option.value
        : undefined;
}

export function validateBio(value: string) {
    const bio = normalizeBio(value) ?? "";
    if (bio.length > BIO_MAX_LENGTH) {
        return `Bio must be at most ${BIO_MAX_LENGTH} characters`;
    }
    return null;
}
