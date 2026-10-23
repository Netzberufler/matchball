import "server-only";

import type { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";
import {
    FEED_PAGE_SIZE,
    type FeedCursor,
    type FeedPage,
    olderThan,
    toPage,
} from "@/features/posts/utils/feed";

// Only what a comment shows
export const commentSelect = {
    id: true,
    content: true,
    createdAt: true,
    author: {
        select: { id: true, username: true, name: true, image: true },
    },
} satisfies Prisma.CommentSelect;

export type PostComment = Prisma.CommentGetPayload<{
    select: typeof commentSelect;
}>;

const UUID_PATTERN = /^[0-9a-f-]{36}$/i;

// One page of a post's comments, newest first, like the feeds. Read from
// the Comment (postId, createdAt, id) index, backwards. The id may come from
// the URL, so it's checked first: Postgres rejects malformed UUIDs with an
// error, and such a post has no comments anyway.
export async function getCommentPage(
    postId: string,
    cursor?: FeedCursor,
): Promise<FeedPage<PostComment>> {
    if (!UUID_PATTERN.test(postId)) {
        return { items: [], nextCursor: null };
    }
    // One extra comment tells whether there is another page
    const comments = await prisma.comment.findMany({
        where: cursor ? { AND: [{ postId }, olderThan(cursor)] } : { postId },
        select: commentSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: FEED_PAGE_SIZE + 1,
    });
    return toPage(comments);
}
