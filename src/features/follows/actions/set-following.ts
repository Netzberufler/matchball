"use server";

import { refresh } from "next/cache";
import { requireSession } from "@/features/auth/lib/session";
import { prisma } from "@/prisma/db";

const UUID_PATTERN = /^[0-9a-f-]{36}$/i;

// Follows or unfollows a user. Setting the state rather than toggling it
// makes repeated calls (double clicks, retries) harmless.
export async function setFollowing(
    userId: unknown,
    follow: unknown,
): Promise<{ isFollowing: boolean }> {
    const { user } = await requireSession();

    // Checked here: actions can be called with anything
    if (
        typeof userId !== "string" ||
        !UUID_PATTERN.test(userId) ||
        typeof follow !== "boolean"
    ) {
        throw new Error("Invalid user or follow state");
    }
    if (userId === user.id) {
        throw new Error("You can't follow yourself");
    }

    const key = { followerId: user.id, followingId: userId };
    // The follow and the followed user's notification change together, and
    // only when a follow was really added or removed, so a follow, unfollow
    // and follow again leaves one notification
    await prisma.$transaction(async (tx) => {
        if (follow) {
            // Does nothing if the follow already exists. Fails if the user
            // doesn't exist, through the foreign key.
            const { count: added } = await tx.follow.createMany({
                data: key,
                skipDuplicates: true,
            });
            if (added) {
                await tx.notification.create({
                    data: { userId, actorId: user.id, type: "FOLLOW" },
                });
            }
        } else {
            const { count: removed } = await tx.follow.deleteMany({
                where: key,
            });
            if (removed) {
                await tx.notification.deleteMany({
                    where: { actorId: user.id, userId, type: "FOLLOW" },
                });
            }
        }
    });
    // Reload the page's server data, e.g. the follower count on the profile
    refresh();
    return { isFollowing: follow };
}
