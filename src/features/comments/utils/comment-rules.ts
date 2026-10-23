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

// A reply to a reply starts with "@username" of the one replied to, so it's
// clear whom it answers. Adds it if the text doesn't start with it.
export function withReplyMention(content: string, username: string) {
    const mention = `@${username}`;
    const startsWithMention =
        content.toLowerCase().startsWith(mention.toLowerCase()) &&
        !/[a-z0-9_]/i.test(content.charAt(mention.length));
    return startsWithMention ? content : `${mention} ${content}`;
}
