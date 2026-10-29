"use server";

import { z } from "zod";
import { requireSession } from "@/features/auth/lib/session";
import { idSchema, parseActionInput } from "@/lib/action-input";
import { prisma } from "@/prisma/db";

// Likes or unlikes a comment and returns its new like count, like setLiked
// does for posts. Setting the state rather than toggling it makes repeated
// calls (double clicks, retries) harmless.
export async function setCommentLiked(
    commentIdInput: unknown,
    likedInput: unknown,
): Promise<{ isLiked: boolean; likeCount: number }> {
    const { user } = await requireSession();

    // Checked here: actions can be called with anything
    const commentId = parseActionInput(idSchema, commentIdInput);
    const liked = parseActionInput(z.boolean(), likedInput);

    const key = { commentId, userId: user.id };
    // The like row and Comment.likeCount change together, and the count
    // only moves when a like was really added or removed, so it can't drift
    const likeCount = await prisma.$transaction(async (tx) => {
        const { count: changed } = liked
            ? // Fails if the comment doesn't exist, through the foreign key
              await tx.commentLike.createMany({
                  data: key,
                  skipDuplicates: true,
              })
            : await tx.commentLike.deleteMany({ where: key });

        if (!changed) {
            const comment = await tx.comment.findUniqueOrThrow({
                where: { id: commentId },
                select: { likeCount: true },
            });
            return comment.likeCount;
        }

        const comment = await tx.comment.update({
            where: { id: commentId },
            data: { likeCount: liked ? { increment: 1 } : { decrement: 1 } },
            select: { likeCount: true, authorId: true, postId: true },
        });
        // Its author is notified of the like, and the notification goes
        // again with an unlike
        if (liked && comment.authorId !== user.id) {
            await tx.notification.create({
                data: {
                    userId: comment.authorId,
                    actorId: user.id,
                    type: "LIKE",
                    postId: comment.postId,
                    commentId,
                },
            });
        } else if (!liked) {
            await tx.notification.deleteMany({
                where: { commentId, actorId: user.id, type: "LIKE" },
            });
        }
        return comment.likeCount;
    });

    return { isLiked: liked, likeCount };
}
