import "server-only";

import type { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";
import { mentionsSelect, toUsernames } from "@/features/mentions/lib/queries";
import {
    FEED_PAGE_SIZE,
    type FeedCursor,
    type FeedPage,
    olderThan,
    toPage,
} from "@/features/posts/utils/feed";

// Only what a comment shows, as seen by the viewer. `likes` holds the
// viewer's like, if any: Prisma loads them for a whole page in one query,
// which the CommentLike primary key (commentId, userId) answers.
export function commentSelect(viewerId: string) {
    return {
        id: true,
        content: true,
        createdAt: true,
        likeCount: true,
        author: {
            select: { id: true, username: true, name: true, image: true },
        },
        mentions: mentionsSelect,
        likes: {
            where: { userId: viewerId },
            select: { userId: true },
            take: 1,
        },
    } satisfies Prisma.CommentSelect;
}

type CommentRow = Prisma.CommentGetPayload<{
    select: ReturnType<typeof commentSelect>;
}>;

export type PostComment = Omit<CommentRow, "mentions" | "likes"> & {
    // The usernames mentioned in the text that belong to real users
    mentions: string[];
    // Whether the viewer likes the comment
    isLiked: boolean;
};

export function toPostComment({
    mentions,
    likes,
    ...comment
}: CommentRow): PostComment {
    return {
        ...comment,
        mentions: toUsernames(mentions),
        isLiked: likes.length > 0,
    };
}

const UUID_PATTERN = /^[0-9a-f-]{36}$/i;

// One page of a post's comments, newest first, like the feeds. Read from
// the Comment (postId, createdAt, id) index, backwards. The id may come from
// the URL, so it's checked first: Postgres rejects malformed UUIDs with an
// error, and such a post has no comments anyway.
export async function getCommentPage(
    postId: string,
    viewerId: string,
    cursor?: FeedCursor,
): Promise<FeedPage<PostComment>> {
    if (!UUID_PATTERN.test(postId)) {
        return { items: [], nextCursor: null };
    }
    // One extra comment tells whether there is another page
    const comments = await prisma.comment.findMany({
        where: cursor ? { AND: [{ postId }, olderThan(cursor)] } : { postId },
        select: commentSelect(viewerId),
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: FEED_PAGE_SIZE + 1,
    });
    return toPage(comments.map(toPostComment));
}
