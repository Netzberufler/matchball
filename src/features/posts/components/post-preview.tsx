import { UserAvatar } from "@/components/ui/user-avatar";
import type { FeedPost } from "@/features/posts/lib/queries";
import {
    formatFullPostDate,
    formatPostDate,
} from "@/features/posts/utils/format-post-date";

// A read-only post, e.g. in the reply popup to show what's being replied
// to: author, time and text, without links or buttons
export function PostPreview({ post }: { post: FeedPost }) {
    const { author } = post;

    return (
        <div className="flex gap-3">
            <UserAvatar name={author.name} image={author.image} />
            <div className="min-w-0 flex-1">
                <p className="flex items-baseline gap-1 text-sm">
                    <span className="truncate font-semibold text-foreground">
                        {author.name}
                    </span>{" "}
                    <span className="truncate text-muted">
                        @{author.username}
                    </span>
                    <span className="text-muted" aria-hidden>
                        ·
                    </span>
                    {/* The relative time can differ between the server and
                        the browser, e.g. "4m" and "5m" */}
                    <time
                        suppressHydrationWarning
                        className="shrink-0 text-muted"
                        dateTime={post.createdAt.toISOString()}
                        title={formatFullPostDate(post.createdAt)}
                    >
                        {formatPostDate(post.createdAt)}
                    </time>
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words">
                    {post.content}
                </p>
            </div>
        </div>
    );
}
