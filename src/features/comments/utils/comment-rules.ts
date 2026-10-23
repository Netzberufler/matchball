// Shared by the comment form and the createComment action

// Also the column size in schema.prisma
export const COMMENT_MAX_LENGTH = 160;

export function validateCommentContent(value: string) {
    const content = value.trim();
    if (!content) {
        return "Write something first";
    }
    if (content.length > COMMENT_MAX_LENGTH) {
        return `Replies can be at most ${COMMENT_MAX_LENGTH} characters`;
    }
    return null;
}
