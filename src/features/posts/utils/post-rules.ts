// Shared by the post form and the createPost action

// Also the column size in schema.prisma
export const POST_MAX_LENGTH = 160;

export function validatePostContent(value: string) {
    const content = value.trim();
    if (!content) {
        return "Write something first";
    }
    if (content.length > POST_MAX_LENGTH) {
        return `Posts can be at most ${POST_MAX_LENGTH} characters`;
    }
    return null;
}
