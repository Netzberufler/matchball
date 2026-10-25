import "server-only";

import { cache } from "react";
import { prisma } from "@/prisma/db";

// The user a profile page shows, or null if there's no such user.
// cache() shares the lookup between generateMetadata and the page.
export const getProfileUser = cache(async (username: string) => {
    return prisma.user.findUnique({
        // Usernames are stored in lowercase
        where: { username: username.toLowerCase() },
        select: {
            id: true,
            username: true,
            name: true,
            image: true,
            bio: true,
            // Each count reads an index: Post (authorId, ...), and Follow's
            // primary key and (followingId, followerId). If they get slow
            // with many rows, store them as counters on User instead.
            _count: {
                select: { posts: true, followers: true, following: true },
            },
        },
    });
});
