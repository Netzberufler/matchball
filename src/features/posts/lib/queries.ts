import "server-only";

import { cache } from "react";
import type { Prisma } from "@/prisma/generated/client";
import { idSchema } from "@/lib/action-input";
import { prisma } from "@/prisma/db";
import { getFollowingIds } from "@/features/follows/lib/queries";
import { mentionsSelect, toUsernames } from "@/features/mentions/lib/queries";
import { escapeLike, searchTerms } from "@/features/search/utils/search-query";
import {
    FEED_PAGE_SIZE,
    type Feed,
    type FeedPage,
    olderThan,
    type PostCursor,
    toPage,
} from "@/features/posts/utils/feed";
import { publicUserSelect } from "@/features/profile/utils/public-user";

// The popular feed's posts are this recent, and liked at least once
const POPULAR_POSTS_MAX_AGE_DAYS = 30;
// Popular posts shown per page, a few at a time
export const POPULAR_PAGE_SIZE = 5;

// Only what a post shows, as seen by the viewer. `likes` holds the viewer's
// like, if any: Prisma loads them for a whole page in one query, which the
// Like primary key (postId, userId) answers.
function postSelect(viewerId: string) {
    return {
        id: true,
        content: true,
        createdAt: true,
        likeCount: true,
        commentCount: true,
        author: { select: publicUserSelect },
        likes: {
            where: { userId: viewerId },
            select: { userId: true },
            take: 1,
        },
        // Also one query per page, on the PostMention primary key
        mentions: mentionsSelect,
    } satisfies Prisma.PostSelect;
}

type PostRow = Prisma.PostGetPayload<{
    select: ReturnType<typeof postSelect>;
}>;

export type FeedPost = Omit<PostRow, "likes" | "mentions"> & {
    // Whether the viewer likes the post
    isLiked: boolean;
    // The usernames mentioned in the text that belong to real users
    mentions: string[];
};

function toFeedPost({ likes, mentions, ...post }: PostRow): FeedPost {
    return {
        ...post,
        isLiked: likes.length > 0,
        mentions: toUsernames(mentions),
    };
}

// One post, for its own page, or null if there's no such post. The id comes
// from the URL, so it's checked first: Postgres rejects malformed UUIDs with
// an error. cache() shares the lookup between generateMetadata and the page.
export const getPost = cache(async (id: string, viewerId: string) => {
    if (!idSchema.safeParse(id).success) {
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
        // Case-insensitive, anywhere in the text (ILIKE), on the trigram
        // index on Post.content
        case "search":
            return {
                AND: searchTerms(feed.query).map((term) => ({
                    content: {
                        contains: escapeLike(term),
                        mode: "insensitive" as const,
                    },
                })),
            };
        case "popular":
            return {
                likeCount: { gt: 0 },
                createdAt: {
                    gte: new Date(
                        Date.now() -
                            POPULAR_POSTS_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
                    ),
                },
            };
    }
}

// Whether anyone the viewer follows has posted: if not, their home feed has
// nothing but their own posts. One lookup per followed author on the
// (authorId, createdAt, id) index, stopping at the first post.
export async function hasPostsByFollowedAuthors(viewerId: string) {
    const followingIds = await getFollowingIds(viewerId);
    if (followingIds.length === 0) {
        return false;
    }
    const post = await prisma.post.findFirst({
        where: { authorId: { in: followingIds } },
        select: { id: true },
    });
    return post !== null;
}

// Posts after the cursor in the popular feed's order: fewer likes, or just
// as many and older
function lessPopularThan(cursor: PostCursor): Prisma.PostWhereInput {
    return {
        OR: [
            { likeCount: { lt: cursor.likeCount } },
            { likeCount: cursor.likeCount, ...olderThan(cursor) },
        ],
    };
}

// One page of a feed, newest first with id breaking ties; the popular feed
// is sorted by likes before that. Without a cursor it's the first page;
// with one, the page after the post it points to.
export async function getFeedPage(
    feed: Feed,
    viewerId: string,
    cursor?: PostCursor,
): Promise<FeedPage<FeedPost, PostCursor>> {
    const isPopular = feed.type === "popular";
    const pageSize = isPopular ? POPULAR_PAGE_SIZE : FEED_PAGE_SIZE;
    const where = await feedWhere(feed, viewerId);
    const posts = await prisma.post.findMany({
        where: cursor
            ? {
                  AND: [
                      where,
                      isPopular ? lessPopularThan(cursor) : olderThan(cursor),
                  ],
              }
            : where,
        select: postSelect(viewerId),
        orderBy: [
            ...(isPopular ? [{ likeCount: "desc" as const }] : []),
            { createdAt: "desc" },
            { id: "desc" },
        ],
        // One extra post tells whether there is another page
        take: pageSize + 1,
    });
    const page = toPage(posts.map(toFeedPost), pageSize);
    const last = page.items.at(-1);
    return {
        items: page.items,
        nextCursor:
            page.nextCursor && last
                ? { ...page.nextCursor, likeCount: last.likeCount }
                : null,
    };
}
