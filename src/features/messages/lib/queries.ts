import "server-only";

import { cache } from "react";
import type { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";
import { conversationPair } from "@/features/messages/utils/message-rules";
import {
    type FeedCursor,
    type FeedPage,
    newerThan,
    olderThan,
    toPage,
} from "@/features/posts/utils/feed";
import {
    type PublicUser,
    publicUserSelect,
} from "@/features/profile/utils/public-user";

// Conversations are private: every query here takes the signed-in user's
// id and only finds conversations they're one of the two users of.

// Conversations shown per page on /messages
const CONVERSATION_PAGE_SIZE = 20;
// Messages loaded at once when a conversation opens, and per older page
export const MESSAGE_PAGE_SIZE = 30;
// Messages a poll brings at most; the rest come with the next one
const NEW_MESSAGES_MAX = 100;
// People you follow suggested in the New chat popup
const CHAT_SUGGESTIONS_COUNT = 5;

// The user a conversation page is with, or null if there's no such user.
// cache() shares the lookup between generateMetadata and the page.
export const getChatPartner = cache(
    async (username: string): Promise<PublicUser | null> => {
        return prisma.user.findUnique({
            // Usernames are stored in lowercase
            where: { username: username.toLowerCase() },
            select: publicUserSelect,
        });
    },
);

// The id of the conversation between the two users, or null while neither
// has written. Reads the unique (user1Id, user2Id) index.
export async function findConversationId(userId: string, otherUserId: string) {
    const conversation = await prisma.conversation.findUnique({
        where: { user1Id_user2Id: conversationPair(userId, otherUserId) },
        select: { id: true },
    });
    return conversation?.id ?? null;
}

// A conversation in the list on /messages: who it's with, when its latest
// message was sent and how many of the other user's messages are unread
export type ConversationListItem = {
    id: string;
    partner: PublicUser;
    lastMessageAt: Date;
    unreadCount: number;
};

// One page of the user's conversations, the most recent first, with id
// breaking ties. Paged by (lastMessageAt, id), in FeedCursor's createdAt.
export async function getConversationsPage(
    userId: string,
    cursor?: FeedCursor,
): Promise<FeedPage<ConversationListItem>> {
    const conversations = await prisma.conversation.findMany({
        where: {
            AND: [
                { OR: [{ user1Id: userId }, { user2Id: userId }] },
                ...(cursor
                    ? [
                          {
                              OR: [
                                  { lastMessageAt: { lt: cursor.createdAt } },
                                  {
                                      lastMessageAt: cursor.createdAt,
                                      id: { lt: cursor.id },
                                  },
                              ],
                          },
                      ]
                    : []),
            ],
        },
        select: {
            id: true,
            lastMessageAt: true,
            user1Id: true,
            user1: { select: publicUserSelect },
            user2: { select: publicUserSelect },
        },
        orderBy: [{ lastMessageAt: "desc" }, { id: "desc" }],
        // One extra conversation tells whether there is another page
        take: CONVERSATION_PAGE_SIZE + 1,
    });
    const hasMore = conversations.length > CONVERSATION_PAGE_SIZE;
    const shown = conversations.slice(0, CONVERSATION_PAGE_SIZE);

    // The unread counts of this page's conversations, in one query on the
    // Message (recipientId, readAt) index
    const unread =
        shown.length === 0
            ? []
            : await prisma.message.groupBy({
                  by: ["conversationId"],
                  where: {
                      recipientId: userId,
                      readAt: null,
                      conversationId: { in: shown.map(({ id }) => id) },
                  },
                  _count: { _all: true },
              });
    const unreadCounts = new Map(
        unread.map((row) => [row.conversationId, row._count._all]),
    );

    const items = shown.map((conversation) => ({
        id: conversation.id,
        partner:
            conversation.user1Id === userId
                ? conversation.user2
                : conversation.user1,
        lastMessageAt: conversation.lastMessageAt,
        unreadCount: unreadCounts.get(conversation.id) ?? 0,
    }));
    const last = items.at(-1);
    return {
        items,
        nextCursor:
            hasMore && last
                ? { createdAt: last.lastMessageAt, id: last.id }
                : null,
    };
}

const messageSelect = {
    id: true,
    content: true,
    createdAt: true,
    senderId: true,
} satisfies Prisma.MessageSelect;

type MessageRow = Prisma.MessageGetPayload<{ select: typeof messageSelect }>;

// A message as the viewer sees it
export type ChatMessage = {
    id: string;
    content: string;
    createdAt: Date;
    // Sent by the viewer, not by the other user
    isOwn: boolean;
};

function toChatMessage(
    { senderId, ...message }: MessageRow,
    viewerId: string,
): ChatMessage {
    return { ...message, isOwn: senderId === viewerId };
}

// One page of a conversation's messages, newest first: the latest when it
// opens, then older ones above them. Reads the Message (conversationId,
// createdAt, id) index in order.
export async function getMessagesPage(
    conversationId: string,
    viewerId: string,
    cursor?: FeedCursor,
): Promise<FeedPage<ChatMessage>> {
    const where = { conversationId };
    const messages = await prisma.message.findMany({
        where: cursor ? { ...where, ...olderThan(cursor) } : where,
        select: messageSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        // One extra message tells whether there is another page
        take: MESSAGE_PAGE_SIZE + 1,
    });
    return toPage(
        messages.map((message) => toChatMessage(message, viewerId)),
        MESSAGE_PAGE_SIZE,
    );
}

// The messages sent after the cursor (the latest one shown), oldest first,
// for an open conversation to add below the others
export async function getNewerMessages(
    conversationId: string,
    viewerId: string,
    cursor: FeedCursor | null,
): Promise<ChatMessage[]> {
    const where = { conversationId };
    const messages = await prisma.message.findMany({
        where: cursor ? { ...where, ...newerThan(cursor) } : where,
        select: messageSelect,
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: NEW_MESSAGES_MAX,
    });
    return messages.map((message) => toChatMessage(message, viewerId));
}

// How many messages to the user are unread, for the nav. Reads the Message
// (recipientId, readAt) index.
export function countUnreadMessages(userId: string) {
    return prisma.message.count({
        where: { recipientId: userId, readAt: null },
    });
}

// Marks the messages the user received in the conversation as read now.
// Only unread ones, so the first time read stays.
export async function markMessagesRead(conversationId: string, userId: string) {
    const { count } = await prisma.message.updateMany({
        where: { conversationId, recipientId: userId, readAt: null },
        data: { readAt: new Date() },
    });
    return count;
}

// People the user follows, the latest follows first, to suggest in the
// New chat popup. Reads the Follow (followerId, createdAt, followingId)
// index.
export async function getChatSuggestions(
    userId: string,
): Promise<PublicUser[]> {
    const follows = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { following: { select: publicUserSelect } },
        orderBy: [{ createdAt: "desc" }, { followingId: "desc" }],
        take: CHAT_SUGGESTIONS_COUNT,
    });
    return follows.map(({ following }) => following);
}
