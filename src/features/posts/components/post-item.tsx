import { Heart, MessageCircle } from "lucide-react";
import { Button, Card } from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { FeedPost } from "@/features/posts/lib/queries";
import {
    formatFullPostDate,
    formatPostDate,
} from "@/features/posts/utils/format-post-date";

export function PostItem({ post }: { post: FeedPost }) {
    const { author } = post;

    return (
        <Card className="flex-row gap-3">
            <UserAvatar image={author.image} />
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1 text-sm">
                    <span className="truncate font-semibold text-foreground">
                        {author.name}
                    </span>
                    <span className="truncate text-muted">
                        @{author.username}
                    </span>
                    <span className="text-muted" aria-hidden>
                        ·
                    </span>
                    <time
                        className="shrink-0 text-muted"
                        dateTime={post.createdAt.toISOString()}
                        title={formatFullPostDate(post.createdAt)}
                    >
                        {formatPostDate(post.createdAt)}
                    </time>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words">
                    {post.content}
                </p>
                {/* TODO: replies and likes, with their counts */}
                <div className="-ml-2 mt-2 flex gap-6">
                    <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        aria-label="Reply"
                        className="text-muted"
                    >
                        <MessageCircle className="size-4" aria-hidden />
                    </Button>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        aria-label="Like"
                        className="text-muted"
                    >
                        <Heart className="size-4" aria-hidden />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
