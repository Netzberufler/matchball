"use client";

import { ComposeForm } from "@/features/posts/components/compose-form";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useViewer } from "@/features/auth/components/viewer-provider";
import { createComment } from "@/features/comments/actions/create-comment";
import {
    commentCounts,
    replyCounts,
} from "@/features/comments/lib/comment-count-store";
import {
    addCreatedComment,
    commentListKey,
} from "@/features/comments/lib/created-comments-store";
import { COMMENT_MAX_LENGTH } from "@/features/comments/utils/comment-rules";

// The form for replying to a post, in the reply popup and on the post's
// own page, or with `replyTo`, to one of its comments or replies (in its
// thread, starting with "@username"). Once a reply is saved, the counts
// update everywhere, and the list it belongs in shows it.
export function CommentForm({
    postId,
    replyTo,
    onSuccess,
    autoFocus,
}: {
    postId: string;
    // The comment replied to, and its author's username
    replyTo?: { id: string; username: string };
    onSuccess?: () => void;
    autoFocus?: boolean;
}) {
    // From the ViewerProvider around the feed or post page
    const viewer = useViewer();

    async function action(formData: FormData) {
        const result = await createComment(
            postId,
            replyTo?.id ?? null,
            formData,
        );
        if (result.error === null) {
            const { comment } = result;
            commentCounts.set(postId, result.commentCount);
            for (const [id, count] of Object.entries(result.replyCounts)) {
                replyCounts.set(id, count);
            }
            addCreatedComment(commentListKey(comment, postId), comment);
        }
        return result;
    }

    return (
        <ComposeForm
            avatar={<UserAvatar name={viewer?.name} image={viewer?.image} />}
            placeholder="Post your reply"
            submitLabel="Reply"
            maxLength={COMMENT_MAX_LENGTH}
            action={action}
            onSuccess={onSuccess}
            autoFocus={autoFocus}
            initialContent={replyTo ? `@${replyTo.username} ` : ""}
        />
    );
}
