import { CommentButton } from "@/features/comments/components/comment-button";
import { LikeButton } from "@/features/likes/components/like-button";
import type { FeedPost } from "@/features/posts/lib/queries";

// The reply and like buttons under a post, in feeds and on its own page
export function PostActions({
    post,
    className,
}: {
    post: FeedPost;
    className?: string;
}) {
    return (
        <div className={`-ml-2 flex items-center gap-6 ${className ?? ""}`}>
            <CommentButton post={post} />
            <LikeButton
                kind="post"
                id={post.id}
                isLiked={post.isLiked}
                likeCount={post.likeCount}
            />
        </div>
    );
}
