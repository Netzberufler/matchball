"use client";

import { useId, useState } from "react";
import { Button } from "@heroui/react";
import { replyCounts } from "@/features/comments/lib/comment-count-store";
import { createdComments } from "@/features/comments/lib/created-comments-store";
import type { PostComment } from "@/features/comments/lib/queries";
import { LikeButton } from "@/features/likes/components/like-button";
import { CommentItem } from "./comment-item";
import { ReplyPopupButton } from "./reply-popup-button";

const NO_COMMENTS: PostComment[] = [];

// Replies are indented for the first levels (the thread indents level 1,
// each level from 2 up to this one once more); older, deeper ones line up
// with the last indented level, their "@username" shows whom they answer.
// The comment and the replies above the last indented level can be
// answered (see createComment), with their reply count, and have a "Show
// replies" toggle for the replies below them.
const INDENTED_LEVELS = 2;

// A post's top-level comment with its whole thread below it: every reply at
// every depth, oldest first, each followed by its own replies. The replies
// are hidden until "Show replies" next to the comment's buttons; level 1
// replies have their own toggle for the levels below them. The comment
// icon of the comment and of level 1 replies opens the reply popup for it.
export function CommentThread({
    postId,
    comment,
    replies: loaded,
}: {
    postId: string;
    comment: PostComment;
    // The thread's replies, at any depth, oldest first
    replies: PostComment[];
}) {
    // New replies from this tab that weren't loaded (the store has them
    // newest first); they're the newest, so they come after the loaded ones
    const created = createdComments.useValue(
        `thread:${comment.id}`,
        NO_COMMENTS,
    );
    const loadedIds = new Set(loaded.map((reply) => reply.id));
    const replies = threadOrder(comment.id, [
        ...loaded,
        ...created.filter((reply) => !loadedIds.has(reply.id)).reverse(),
    ]);

    const threadId = useId();
    // The comment and replies whose replies are shown
    const [openIds, setOpenIds] = useState<ReadonlySet<string>>(
        () => new Set(),
    );
    // A reply the viewer just wrote in this thread opens the toggles above
    // it, so it shows up
    const [createdCount, setCreatedCount] = useState(created.length);
    if (created.length !== createdCount) {
        setCreatedCount(created.length);
        const newest =
            created.length > createdCount &&
            replies.find(({ reply }) => reply.id === created[0].id);
        if (newest) {
            setOpenIds(new Set([...openIds, ...newest.toggleIds]));
        }
    }

    function toggle(id: string) {
        setOpenIds((current) => {
            const next = new Set(current);
            if (!next.delete(id)) {
                next.add(id);
            }
            return next;
        });
    }

    const visible = replies.filter(({ toggleIds }) =>
        toggleIds.every((id) => openIds.has(id)),
    );

    return (
        <>
            <ReplyableComment
                postId={postId}
                comment={comment}
                className="p-4"
                showReplies={
                    replies.length > 0 && (
                        <RepliesToggle
                            isOpen={openIds.has(comment.id)}
                            controls={threadId}
                            onToggle={() => toggle(comment.id)}
                        />
                    )
                }
            />
            {visible.length > 0 && (
                // Indented to line up with the comment's text
                <ul
                    id={threadId}
                    className="divide-y divide-separator pr-4 pb-4 pl-[3.25rem]"
                >
                    {visible.map(({ reply, level, hasReplies }) => (
                        <li
                            key={reply.id}
                            // Level 1 is indented by the thread; the levels
                            // after it, up to INDENTED_LEVELS, once more each
                            style={{
                                paddingLeft: `${
                                    (Math.min(level, INDENTED_LEVELS) - 1) *
                                    3.25
                                }rem`,
                            }}
                        >
                            <ReplyableComment
                                postId={postId}
                                comment={reply}
                                className="py-3"
                                canReply={level < INDENTED_LEVELS}
                                showReplies={
                                    level < INDENTED_LEVELS &&
                                    hasReplies && (
                                        <RepliesToggle
                                            isOpen={openIds.has(reply.id)}
                                            onToggle={() => toggle(reply.id)}
                                        />
                                    )
                                }
                            />
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}

// "Show replies" / "Hide replies", ghost like the icon buttons, for the
// same hover
function RepliesToggle({
    isOpen,
    controls,
    onToggle,
}: {
    isOpen: boolean;
    controls?: string;
    onToggle: () => void;
}) {
    return (
        <Button
            size="sm"
            variant="ghost"
            aria-expanded={isOpen}
            aria-controls={isOpen ? controls : undefined}
            className="px-2 text-accent"
            onPress={onToggle}
        >
            {isOpen ? "Hide replies" : "Show replies"}
        </Button>
    );
}

// A comment or reply with its buttons. If `canReply`, the comment icon
// with the reply count opens the reply popup for it. `showReplies` goes
// before the buttons.
function ReplyableComment({
    postId,
    comment,
    className,
    canReply = true,
    showReplies,
}: {
    postId: string;
    comment: PostComment;
    className: string;
    canReply?: boolean;
    showReplies?: React.ReactNode;
}) {
    const replyCount = replyCounts.useValue(comment.id, comment.replyCount);

    return (
        <CommentItem
            comment={comment}
            className={className}
            actions={
                <>
                    {showReplies}
                    {canReply && (
                        <ReplyPopupButton
                            postId={postId}
                            replyToId={comment.id}
                            item={comment}
                            count={replyCount}
                        />
                    )}
                    <LikeButton
                        kind="comment"
                        id={comment.id}
                        isLiked={comment.isLiked}
                        likeCount={comment.likeCount}
                    />
                </>
            }
        />
    );
}

// The replies in reading order, each with its level (1 for replies to the
// top-level comment), whether it has replies, and the toggles that must be
// open for it to show (its ancestors above INDENTED_LEVELS, the top-level
// comment included): each followed by its own replies, depth first.
// Siblings keep their order in `replies` (oldest first).
function threadOrder(rootId: string, replies: PostComment[]) {
    const childrenOf = new Map<string, PostComment[]>();
    for (const reply of replies) {
        const parentId = reply.parentId ?? rootId;
        childrenOf.set(parentId, [...(childrenOf.get(parentId) ?? []), reply]);
    }
    const ordered: {
        reply: PostComment;
        level: number;
        hasReplies: boolean;
        toggleIds: string[];
    }[] = [];
    const visit = (parentId: string, level: number, toggleIds: string[]) => {
        for (const child of childrenOf.get(parentId) ?? []) {
            ordered.push({
                reply: child,
                level,
                hasReplies: childrenOf.has(child.id),
                toggleIds,
            });
            visit(
                child.id,
                level + 1,
                level < INDENTED_LEVELS ? [...toggleIds, child.id] : toggleIds,
            );
        }
    };
    visit(rootId, 1, [rootId]);
    return ordered;
}
