"use client";

import { commentCounts } from "@/features/comments/lib/comment-count-store";
import type { FeedPost } from "@/features/posts/lib/queries";
import { ReplyPopupButton } from "./reply-popup-button";

// The comment icon and count under a post: opens the reply popup for it
export function CommentButton({ post }: { post: FeedPost }) {
    const commentCount = commentCounts.useValue(post.id, post.commentCount);
    return (
        <ReplyPopupButton postId={post.id} item={post} count={commentCount} />
    );
}
