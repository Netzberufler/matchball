"use client";

import { ComposeForm } from "@/components/ui/compose-form";
import { createComment } from "@/features/comments/actions/create-comment";
import { commentCounts } from "@/features/comments/lib/comment-count-store";
import { addCreatedComment } from "@/features/comments/lib/created-comments-store";
import { COMMENT_MAX_LENGTH } from "@/features/comments/utils/comment-rules";

// The form for replying to a post, in the reply popup and on the post's
// own page. Once a reply is saved, the post's comment count updates
// everywhere, and the post's replies list shows it.
export function CommentForm({
    postId,
    onSuccess,
    autoFocus,
}: {
    postId: string;
    onSuccess?: () => void;
    autoFocus?: boolean;
}) {
    async function action(formData: FormData) {
        const result = await createComment(postId, formData);
        if (result.error === null) {
            commentCounts.set(postId, result.commentCount);
            addCreatedComment(postId, result.comment);
        }
        return result;
    }

    return (
        <ComposeForm
            placeholder="Post your reply"
            submitLabel="Reply"
            maxLength={COMMENT_MAX_LENGTH}
            action={action}
            onSuccess={onSuccess}
            autoFocus={autoFocus}
        />
    );
}
