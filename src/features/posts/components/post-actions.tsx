import { MessageCircle } from "lucide-react";
import { Button } from "@heroui/react";
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
            {/* TODO: replies, with their count */}
            <Button
                isIconOnly
                size="sm"
                variant="ghost"
                aria-label="Reply"
                className="text-muted"
            >
                <MessageCircle className="size-4" aria-hidden />
            </Button>
            <LikeButton
                postId={post.id}
                isLiked={post.isLiked}
                likeCount={post.likeCount}
            />
        </div>
    );
}
