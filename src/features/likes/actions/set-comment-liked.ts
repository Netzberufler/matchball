"use server";

import { requireSession } from "@/features/auth/lib/session";
import { prisma } from "@/prisma/db";

const UUID_PATTERN = /^[0-9a-f-]{36}$/i;

// Likes or unlikes a comment and returns its new like count, like setLiked
// does for posts. Setting the state rather than toggling it makes repeated
// calls (double clicks, retries) harmless.
export async function setCommentLiked(
    commentId: unknown,
    liked: unknown,
): Promise<{ isLiked: boolean; likeCount: number }> {
    const { user } = await requireSession();

    // Checked here: actions can be called with anything
    if (
        typeof commentId !== "string" ||
        !UUID_PATTERN.test(commentId) ||
        typeof liked !== "boolean"
    ) {
        throw new Error("Invalid comment or like state");
    }

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

        const comment = changed
            ? await tx.comment.update({
                  where: { id: commentId },
                  data: {
                      likeCount: liked ? { increment: 1 } : { decrement: 1 },
                  },
                  select: { likeCount: true },
              })
            : await tx.comment.findUniqueOrThrow({
                  where: { id: commentId },
                  select: { likeCount: true },
              });
        return comment.likeCount;
    });

    return { isLiked: liked, likeCount };
}
