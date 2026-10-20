import "server-only";

import type { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";

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

// Every feed goes through here, so they all share one stable order: newest
// first, id breaking ties. Infinite loading can then add a (createdAt, id)
// cursor and a `take` limit in this one place.
function findPosts(where: Prisma.PostWhereInput) {
    return prisma.post.findMany({
        where,
        select: postSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
}

// The home feed. For now every post; once following exists, only posts by
// authors the viewer follows (and the viewer's own).
export function getHomeFeedPosts() {
    return findPosts({});
}

export function getUserPosts(authorId: string) {
    return findPosts({ authorId });
}
