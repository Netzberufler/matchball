// Shared by the message form and the sendMessage action
import * as z from "zod/mini";

// Also the column size in schema.prisma
export const MESSAGE_MAX_LENGTH = 1000;

// A message's text as saved, trimmed
export const messageContentSchema = z
    .string("Write something first")
    .check(
        z.trim(),
        z.minLength(1, "Write something first"),
        z.maxLength(
            MESSAGE_MAX_LENGTH,
            `Messages can be at most ${MESSAGE_MAX_LENGTH} characters`,
        ),
    );

// The two users of a conversation in the order they're stored: user1Id is
// the smaller id (see Conversation in schema.prisma)
export function conversationPair(userId: string, otherUserId: string) {
    return userId < otherUserId
        ? { user1Id: userId, user2Id: otherUserId }
        : { user1Id: otherUserId, user2Id: userId };
}
