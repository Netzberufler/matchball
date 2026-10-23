"use client";

import { ComposeForm } from "@/components/ui/compose-form";
import { createComment } from "@/features/comments/actions/create-comment";
import { commentCounts } from "@/features/comments/lib/comment-count-store";
import type { PostComment } from "@/features/comments/lib/queries";
import { COMMENT_MAX_LENGTH } from "@/features/comments/utils/comment-rules";

// The form for replying to a post, in the reply popup and on the post's
// own page. The post's comment count updates everywhere once it's saved,
// and `onCreated` gets the new comment, e.g. to show it.
export function CommentForm({
    postId,
    onCreated,
    onSuccess,
    autoFocus,
}: {
    postId: string;
    onCreated?: (comment: PostComment) => void;
    onSuccess?: () => void;
    autoFocus?: boolean;
}) {
    async function action(formData: FormData) {
        const result = await createComment(postId, formData);
        if (result.error === null) {
            commentCounts.set(postId, result.commentCount);
            onCreated?.(result.comment);
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
