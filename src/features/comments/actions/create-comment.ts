"use server";

import { requireSession } from "@/features/auth/lib/session";
import {
    commentSelect,
    type PostComment,
    toPostComment,
} from "@/features/comments/lib/queries";
import {
    validateCommentContent,
    withReplyMention,
} from "@/features/comments/utils/comment-rules";
import { findMentionedUsers } from "@/features/mentions/lib/queries";
import { prisma } from "@/prisma/db";

const UUID_PATTERN = /^[0-9a-f-]{36}$/i;

// Adds a comment to a post, or with `replyToId`, a reply to one of its
// comments or to a level 1 reply (deeper replies can't be answered, so a
// thread is at most two levels deep). Returns it, to show it right away,
// and the new counts: the post's (all its comments) and, for a reply, those
// of the top-level comment and level 1 reply above it (each counts all
// replies below it).
export async function createComment(
    postId: unknown,
    replyToId: unknown,
    formData: FormData,
): Promise<
    | { error: string; comment?: never }
    | {
          error: null;
          comment: PostComment;
          commentCount: number;
          // By comment id
          replyCounts: Record<string, number>;
      }
> {
    const { user } = await requireSession();

    // Checked here: actions can be called with anything
    if (
        typeof postId !== "string" ||
        !UUID_PATTERN.test(postId) ||
        (replyToId !== null &&
            (typeof replyToId !== "string" || !UUID_PATTERN.test(replyToId)))
    ) {
        throw new Error("Invalid post or comment");
    }

    let content = String(formData.get("content") ?? "").trim();
    const parentId = replyToId;
    // The thread's top-level comment: the parent's, or the parent itself
    let rootId: string | null = null;
    if (parentId !== null) {
        const parent = await prisma.comment.findUnique({
            where: { id: parentId },
            select: {
                postId: true,
                parentId: true,
                rootId: true,
                author: { select: { username: true } },
            },
        });
        // The parent must be a top-level comment or a level 1 reply (one
        // that answers the top-level comment)
        if (
            !parent ||
            parent.postId !== postId ||
            (parent.parentId !== null && parent.parentId !== parent.rootId)
        ) {
            throw new Error("Invalid comment");
        }
        rootId = parent.rootId ?? parentId;
        content = withReplyMention(content, parent.author.username);
    }

    const error = validateCommentContent(content);
    if (error) {
        return { error };
    }

    const mentions = await findMentionedUsers(content);

    // The comment, its mentions and the counts change together. Creating
    // the comment fails if the post doesn't exist, through the foreign key.
    return prisma.$transaction(async (tx) => {
        const comment = await tx.comment.create({
            data: {
                content,
                postId,
                parentId,
                rootId,
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
        // The parent and the top-level comment (the same one for a reply
        // to it)
        const counted =
            parentId && rootId
                ? await tx.comment.updateManyAndReturn({
                      where: { id: { in: [parentId, rootId] } },
                      data: { replyCount: { increment: 1 } },
                      select: { id: true, replyCount: true },
                  })
                : [];
        return {
            error: null,
            comment: toPostComment(comment),
            commentCount,
            replyCounts: Object.fromEntries(
                counted.map(({ id, replyCount }) => [id, replyCount]),
            ),
        };
    });
}
