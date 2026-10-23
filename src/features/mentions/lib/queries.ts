import "server-only";

import { prisma } from "@/prisma/db";
import { findMentionedUsernames } from "@/features/mentions/utils/mentions";

// The users mentioned in a text that really exist, as rows for a
// PostMention or CommentMention createMany. One query on the unique
// username index.
export async function findMentionedUsers(text: string) {
    const usernames = findMentionedUsernames(text);
    if (usernames.length === 0) {
        return [];
    }
    const users = await prisma.user.findMany({
        where: { username: { in: usernames } },
        select: { id: true },
    });
    return users.map((user) => ({ userId: user.id }));
}

// What posts and comments select to know their mentions
export const mentionsSelect = {
    select: { user: { select: { username: true } } },
} as const;

export function toUsernames(mentions: { user: { username: string } }[]) {
    return mentions.map((mention) => mention.user.username);
}
