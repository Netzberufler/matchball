import "server-only";

import type { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";
import { getFollowingIds } from "@/features/follows/lib/queries";
import {
    FEED_PAGE_SIZE,
    type FeedCursor,
    type FeedPage,
    type Feed,
} from "@/features/posts/utils/feed";

// Only what a post in a feed shows. Like and reply counts go here once
// those features exist.
const postSelect = {
    id: true,
    content: true,
    createdAt: true,
    author: {
        select: { id: true, username: true, name: true, image: true },
    },
} satisfies Prisma.PostSelect;

export type FeedPost = Prisma.PostGetPayload<{ select: typeof postSelect }>;

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
        select: postSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: FEED_PAGE_SIZE + 1,
    });

    const hasMore = posts.length > FEED_PAGE_SIZE;
    const page = hasMore ? posts.slice(0, FEED_PAGE_SIZE) : posts;
    const last = page.at(-1);
    return {
        posts: page,
        nextCursor:
            hasMore && last ? { createdAt: last.createdAt, id: last.id } : null,
    };
}
