import "server-only";

import type { Prisma } from "@/prisma/generated/client";
import { idSchema } from "@/lib/action-input";
import { prisma } from "@/prisma/db";
import { mentionsSelect, toUsernames } from "@/features/mentions/lib/queries";
import {
    FEED_PAGE_SIZE,
    type FeedCursor,
    type FeedPage,
    newerThan,
    toPage,
} from "@/features/posts/utils/feed";
import { publicUserSelect } from "@/features/profile/utils/public-user";

// Only what a comment shows, as seen by the viewer. `likes` holds the
// viewer's like, if any: Prisma loads them for a whole page in one query,
// which the CommentLike primary key (commentId, userId) answers.
export function commentSelect(viewerId: string) {
    return {
        id: true,
        content: true,
        createdAt: true,
        likeCount: true,
        parentId: true,
        rootId: true,
        replyCount: true,
        author: { select: publicUserSelect },
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

// A page of a post's top-level comments, with every reply in their
// threads (all shown at once), oldest first
export type CommentPage = FeedPage<PostComment> & { replies: PostComment[] };

// One page of a post's top-level comments, oldest first (unlike the feeds),
// so a conversation reads from the top, with all replies in their threads.
// Two queries: the page, on the Comment (postId, parentId, createdAt, id)
// index, then the threads' replies, on the (rootId, createdAt, id) index.
// The id may come from the URL, so it's checked first: Postgres rejects
// malformed UUIDs with an error, and such a post has no comments anyway.
export async function getCommentPage(
    postId: string,
    viewerId: string,
    cursor?: FeedCursor,
): Promise<CommentPage> {
    if (!idSchema.safeParse(postId).success) {
        return { items: [], nextCursor: null, replies: [] };
    }
    // Top-level comments only: replies show under their parent. One extra
    // comment tells whether there is another page.
    const where = { postId, parentId: null };
    const comments = await prisma.comment.findMany({
        where: cursor ? { AND: [where, newerThan(cursor)] } : where,
        select: commentSelect(viewerId),
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: FEED_PAGE_SIZE + 1,
    });
    const page = toPage(comments.map(toPostComment));

    // The threads are built from the replies' parentIds
    const replies =
        page.items.length === 0
            ? []
            : await prisma.comment.findMany({
                  where: {
                      rootId: { in: page.items.map((comment) => comment.id) },
                  },
                  select: commentSelect(viewerId),
                  orderBy: [{ createdAt: "asc" }, { id: "asc" }],
              });
    return { ...page, replies: replies.map(toPostComment) };
}
