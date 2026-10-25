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

export function validateBio(value: string) {
    const bio = normalizeBio(value) ?? "";
    if (bio.length > BIO_MAX_LENGTH) {
        return `Bio must be at most ${BIO_MAX_LENGTH} characters`;
    }
    return null;
}
