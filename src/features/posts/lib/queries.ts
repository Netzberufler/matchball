import "server-only";

import { cache } from "react";
import type { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";
import { getFollowingIds } from "@/features/follows/lib/queries";
import {
    FEED_PAGE_SIZE,
    type FeedCursor,
    type FeedPage,
    type Feed,
} from "@/features/posts/utils/feed";

// Only what a post shows, as seen by the viewer. `likes` holds the viewer's
// like, if any: Prisma loads them for a whole page in one query, which the
// Like primary key (postId, userId) answers. The reply count goes here once
// replies exist.
function postSelect(viewerId: string) {
    return {
        id: true,
        content: true,
        createdAt: true,
        likeCount: true,
        author: {
            select: { id: true, username: true, name: true, image: true },
        },
        likes: {
            where: { userId: viewerId },
            select: { userId: true },
            take: 1,
        },
    } satisfies Prisma.PostSelect;
}

type PostRow = Prisma.PostGetPayload<{
    select: ReturnType<typeof postSelect>;
}>;

export type FeedPost = Omit<PostRow, "likes"> & {
    // Whether the viewer likes the post
    isLiked: boolean;
};

function toFeedPost({ likes, ...post }: PostRow): FeedPost {
    return { ...post, isLiked: likes.length > 0 };
}

const UUID_PATTERN = /^[0-9a-f-]{36}$/i;

// One post, for its own page, or null if there's no such post. The id comes
// from the URL, so it's checked first: Postgres rejects malformed UUIDs with
// an error. cache() shares the lookup between generateMetadata and the page.
export const getPost = cache(async (id: string, viewerId: string) => {
    if (!UUID_PATTERN.test(id)) {
        return null;
    }
    const post = await prisma.post.findUnique({
        where: { id },
        select: postSelect(viewerId),
    });
    return post && toFeedPost(post);
});

// Which posts belong in a feed, as seen by the signed-in viewer
async function feedWhere(
    feed: Feed,
    viewerId: string,
): Promise<Prisma.PostWhereInput> {
    switch (feed.type) {
        // Posts by the authors the viewer follows, and the viewer's own (so
        // a new post shows up under the post form). Looking up the followed
        // ids first lets Postgres use the (authorId, createdAt, id) index for
        // each author, instead of joining Follow for every post.
        case "home":
            return {
                authorId: {
                    in: [viewerId, ...(await getFollowingIds(viewerId))],
                },
            };
        case "user":
            return { authorId: feed.authorId };
    }
}

// Posts that come after the cursor in feed order: older, or just as old
// with a smaller id
function olderThan(cursor: FeedCursor): Prisma.PostWhereInput {
    return {
        OR: [
            { createdAt: { lt: cursor.createdAt } },
            { createdAt: cursor.createdAt, id: { lt: cursor.id } },
        ],
    };
}

// One page of a feed, newest first with id breaking ties. Without a cursor
// it's the first page; with one, the page after the post it points to.
export async function getFeedPage(
    feed: Feed,
    viewerId: string,
    cursor?: FeedCursor,
): Promise<FeedPage<FeedPost>> {
    const where = await feedWhere(feed, viewerId);
    // One extra post tells whether there is another page
    const posts = await prisma.post.findMany({
        where: cursor ? { AND: [where, olderThan(cursor)] } : where,
        select: postSelect(viewerId),
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: FEED_PAGE_SIZE + 1,
    });

    const hasMore = posts.length > FEED_PAGE_SIZE;
    const page = (hasMore ? posts.slice(0, FEED_PAGE_SIZE) : posts).map(
        toFeedPost,
    );
    const last = page.at(-1);
    return {
        posts: page,
        nextCursor:
            hasMore && last ? { createdAt: last.createdAt, id: last.id } : null,
    };
}
