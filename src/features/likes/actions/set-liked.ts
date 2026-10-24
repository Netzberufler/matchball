"use server";

import { requireSession } from "@/features/auth/lib/session";
import { prisma } from "@/prisma/db";

const UUID_PATTERN = /^[0-9a-f-]{36}$/i;

// Likes or unlikes a post and returns the new like count. Setting the state
// rather than toggling it makes repeated calls (double clicks, retries)
// harmless.
export async function setLiked(
    postId: unknown,
    liked: unknown,
): Promise<{ isLiked: boolean; likeCount: number }> {
    const { user } = await requireSession();

    // Checked here: actions can be called with anything
    if (
        typeof postId !== "string" ||
        !UUID_PATTERN.test(postId) ||
        typeof liked !== "boolean"
    ) {
        throw new Error("Invalid post or like state");
    }

    const key = { postId, userId: user.id };
    // The like row and Post.likeCount change together, and the count only
    // moves when a like was really added or removed, so it can't drift
    const likeCount = await prisma.$transaction(async (tx) => {
        const { count: changed } = liked
            ? // Fails if the post doesn't exist, through the foreign key
              await tx.like.createMany({ data: key, skipDuplicates: true })
            : await tx.like.deleteMany({ where: key });

        if (!changed) {
            const post = await tx.post.findUniqueOrThrow({
                where: { id: postId },
                select: { likeCount: true },
            });
            return post.likeCount;
        }

        const post = await tx.post.update({
            where: { id: postId },
            data: { likeCount: liked ? { increment: 1 } : { decrement: 1 } },
            select: { likeCount: true, authorId: true },
        });
        // Its author is notified of the like, and the notification goes
        // again with an unlike
        if (liked && post.authorId !== user.id) {
            await tx.notification.create({
                data: {
                    userId: post.authorId,
                    actorId: user.id,
                    type: "LIKE",
                    postId,
                },
            });
        } else if (!liked) {
            await tx.notification.deleteMany({
                where: {
                    postId,
                    actorId: user.id,
                    commentId: null,
                    type: "LIKE",
                },
            });
        }
        return post.likeCount;
    });

    return { isLiked: liked, likeCount };
}
