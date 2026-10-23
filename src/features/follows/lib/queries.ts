import "server-only";

import { cache } from "react";
import type { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";
import type { FollowListKind } from "@/features/follows/utils/follow-list";
import {
    FEED_PAGE_SIZE,
    type FeedCursor,
    type FeedPage,
    toPage,
} from "@/features/posts/utils/feed";

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

const userSelect = { id: true, username: true, name: true, image: true };

// A user in a follow list. createdAt is when the follow happened: the
// lists are sorted by it, newest first, and page by (createdAt, id).
export type FollowListUser = Prisma.UserGetPayload<{
    select: typeof userSelect;
}> & { createdAt: Date };

// One page of a user's followers or of whom they follow. Each reads one of
// the Follow (user, createdAt, other user) indexes, in order.
export async function getFollowListPage(
    kind: FollowListKind,
    userId: string,
    cursor?: FeedCursor,
): Promise<FeedPage<FollowListUser>> {
    // The column that holds the listed users, and the one for `userId`
    const [listed, owner] =
        kind === "followers"
            ? (["followerId", "followingId"] as const)
            : (["followingId", "followerId"] as const);

    const args = {
        where: {
            [owner]: userId,
            // After the cursor: an older follow, or one just as old with a
            // smaller user id
            ...(cursor && {
                OR: [
                    { createdAt: { lt: cursor.createdAt } },
                    {
                        createdAt: cursor.createdAt,
                        [listed]: { lt: cursor.id },
                    },
                ],
            }),
        },
        orderBy: [{ createdAt: "desc" }, { [listed]: "desc" }],
        // One extra follow tells whether there is another page
        take: FEED_PAGE_SIZE + 1,
    } satisfies Prisma.FollowFindManyArgs;

    const users =
        kind === "followers"
            ? (
                  await prisma.follow.findMany({
                      ...args,
                      select: {
                          createdAt: true,
                          follower: { select: userSelect },
                      },
                  })
              ).map(({ createdAt, follower }) => ({ ...follower, createdAt }))
            : (
                  await prisma.follow.findMany({
                      ...args,
                      select: {
                          createdAt: true,
                          following: { select: userSelect },
                      },
                  })
              ).map(({ createdAt, following }) => ({
                  ...following,
                  createdAt,
              }));
    return toPage(users);
}
