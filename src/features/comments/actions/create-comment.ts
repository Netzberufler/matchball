"use server";

import { requireSession } from "@/features/auth/lib/session";
import {
    commentSelect,
    type PostComment,
    toPostComment,
} from "@/features/comments/lib/queries";
import {
    commentContentSchema,
    typedCommentSchema,
    withReplyMention,
} from "@/features/comments/utils/comment-rules";
import { findMentionedUsers } from "@/features/mentions/lib/queries";
import { mentionNotifications } from "@/features/notifications/lib/notify";
import { idSchema, parseActionInput } from "@/lib/action-input";
import { formText } from "@/lib/form-validation";
import { prisma } from "@/prisma/db";

// Adds a comment to a post, or with `replyToId`, a reply to one of its
// comments or to a level 1 reply (deeper replies can't be answered, so a
// thread is at most two levels deep). Returns it, to show it right away,
// and the new counts: the post's (all its comments) and, for a reply, those
// of the top-level comment and level 1 reply above it (each counts all
// replies below it).
export async function createComment(
    postIdInput: unknown,
    replyToIdInput: unknown,
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
    const postId = parseActionInput(idSchema, postIdInput);
    const parentId = parseActionInput(idSchema.nullable(), replyToIdInput);
    const typed = formText(typedCommentSchema).safeParse(
        formData.get("content"),
    );
    if (!typed.success) {
        return {
            error: typed.error.issues[0]?.message ?? "Write something first",
        };
    }

    let content = typed.data;
    // The thread's top-level comment: the parent's, or the parent itself
    let rootId: string | null = null;
    // Whom the reply answers, for their notification: the parent's author,
    // or for a top-level comment the post's (known below)
    let repliedToId: string | null = null;
    if (parentId !== null) {
        const parent = await prisma.comment.findUnique({
            where: { id: parentId },
            select: {
                postId: true,
                parentId: true,
                rootId: true,
                authorId: true,
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
        repliedToId = parent.authorId;
        content = withReplyMention(content, parent.author.username);
    }

    // The text as saved, with the reply's @mention
    const saved = commentContentSchema.safeParse(content);
    if (!saved.success) {
        return {
            error: saved.error.issues[0]?.message ?? "Write something first",
        };
    }
    content = saved.data;

    const mentions = await findMentionedUsers(content);

    // The comment, its mentions, the notifications and the counts change
    // together. Counting first fails if the post doesn't exist, and tells
    // its author for a top-level comment.
    return prisma.$transaction(async (tx) => {
        const post = await tx.post.update({
            where: { id: postId },
            data: { commentCount: { increment: 1 } },
            select: { commentCount: true, authorId: true },
        });
        repliedToId ??= post.authorId;
        const notifications = [
            ...(repliedToId === user.id
                ? []
                : [
                      {
                          userId: repliedToId,
                          actorId: user.id,
                          type: "REPLY" as const,
                      },
                  ]),
            ...mentionNotifications(mentions, user.id, repliedToId),
        ];
        const comment = await tx.comment.create({
            data: {
                content,
                postId,
                parentId,
                rootId,
                authorId: user.id,
                mentions: { createMany: { data: mentions } },
                notifications: {
                    createMany: {
                        data: notifications.map((notification) => ({
                            ...notification,
                            postId,
                        })),
                    },
                },
            },
            select: commentSelect(user.id),
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
            commentCount: post.commentCount,
            replyCounts: Object.fromEntries(
                counted.map(({ id, replyCount }) => [id, replyCount]),
            ),
        };
    });
}
