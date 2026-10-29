// Shared by the comment form and the createComment action
import * as z from "zod/mini";

// Also the column size in schema.prisma
export const COMMENT_MAX_LENGTH = 160;

const COMMENT_TOO_LONG = `Replies can be at most ${COMMENT_MAX_LENGTH} characters`;

// The text as typed in the form, trimmed. It can still get an @mention in
// front (see withReplyMention), so the result is checked again with
// commentContentSchema.
export const typedCommentSchema = z
    .string("Write something first")
    .check(z.trim(), z.maxLength(COMMENT_MAX_LENGTH, COMMENT_TOO_LONG));

// A comment's text as saved, trimmed
export const commentContentSchema = z
    .string("Write something first")
    .check(
        z.trim(),
        z.minLength(1, "Write something first"),
        z.maxLength(COMMENT_MAX_LENGTH, COMMENT_TOO_LONG),
    );

// A reply to a reply starts with "@username" of the one replied to, so it's
// clear whom it answers. Adds it if the text doesn't start with it.
export function withReplyMention(content: string, username: string) {
    const mention = `@${username}`;
    const startsWithMention =
        content.toLowerCase().startsWith(mention.toLowerCase()) &&
        !/[a-z0-9_]/i.test(content.charAt(mention.length));
    return startsWithMention ? content : `${mention} ${content}`;
}
