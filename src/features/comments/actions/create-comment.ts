"use server";

import { requireSession } from "@/features/auth/lib/session";
import {
    commentSelect,
    type PostComment,
    toPostComment,
} from "@/features/comments/lib/queries";
import { validateCommentContent } from "@/features/comments/utils/comment-rules";
import { findMentionedUsers } from "@/features/mentions/lib/queries";
import { prisma } from "@/prisma/db";

const UUID_PATTERN = /^[0-9a-f-]{36}$/i;

// Adds a comment to a post. Returns it, to show it right away, and the
// post's new comment count.
export async function createComment(
    postId: unknown,
    formData: FormData,
): Promise<
    | { error: string; comment?: never; commentCount?: never }
    | { error: null; comment: PostComment; commentCount: number }
> {
    const { user } = await requireSession();

    // Checked here: actions can be called with anything
    if (typeof postId !== "string" || !UUID_PATTERN.test(postId)) {
        throw new Error("Invalid post");
    }
    const content = String(formData.get("content") ?? "").trim();
    const error = validateCommentContent(content);
    if (error) {
        return { error };
    }

    const mentions = await findMentionedUsers(content);

    // The comment, its mentions and Post.commentCount change together.
    // Creating the comment fails if the post doesn't exist, through the
    // foreign key.
    return prisma.$transaction(async (tx) => {
        const comment = await tx.comment.create({
            data: {
                content,
                postId,
                authorId: user.id,
                mentions: { createMany: { data: mentions } },
            },
            select: commentSelect(user.id),
        });
        const { commentCount } = await tx.post.update({
            where: { id: postId },
            data: { commentCount: { increment: 1 } },
            select: { commentCount: true },
        });
        return {
            error: null,
            comment: toPostComment(comment),
            commentCount,
        };
    });
}
