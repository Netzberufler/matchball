import "server-only";

import { cache } from "react";
import { prisma } from "@/prisma/db";

// The ids of everyone the user follows. Reads only the Follow primary key
// index. cache() runs it once per request.
export const getFollowingIds = cache(async (followerId: string) => {
    const follows = await prisma.follow.findMany({
        where: { followerId },
        select: { followingId: true },
    });
    return follows.map((follow) => follow.followingId);
});

export async function isFollowing(followerId: string, followingId: string) {
    const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId, followingId } },
        select: { followerId: true },
    });
    return follow !== null;
}
