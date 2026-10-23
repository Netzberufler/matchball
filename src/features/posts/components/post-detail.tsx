import Link from "next/link";
import { Card, Skeleton } from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { FeedPost } from "@/features/posts/lib/queries";
import { formatFullPostDate } from "@/features/posts/utils/format-post-date";
import { profilePath } from "@/features/profile/utils/profile-path";
import { PostActions } from "./post-actions";

// A post on its own page: the author on top, laid out like a profile header
// (avatar beside the name and username), then the content, the full date
// and time, and the buttons. In feeds, a post is shown as PostItem.
export function PostDetail({ post }: { post: FeedPost }) {
    const { author } = post;
    const profileHref = profilePath(author.username);

    return (
        <article className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-3">
                {/* Same target as the name link, so only that one is
                    focusable and announced */}
                <Link
                    href={profileHref}
                    tabIndex={-1}
                    aria-hidden
                    className="shrink-0 rounded-full transition-opacity hover:opacity-80"
                >
                    <UserAvatar name={author.name} image={author.image} />
                </Link>
                <Link
                    href={profileHref}
                    className="group flex min-w-0 flex-col"
                >
                    <span className="truncate text-base font-semibold text-foreground group-hover:underline">
                        {author.name}
                    </span>
                    {/* Spaces the link text for screen readers; the line
                        break does the visual spacing */}{" "}
                    <span className="truncate text-sm text-muted">
                        @{author.username}
                    </span>
                </Link>
            </div>
            <p className="whitespace-pre-wrap break-words text-lg">
                {post.content}
            </p>
            <time
                className="text-sm text-muted"
                dateTime={post.createdAt.toISOString()}
            >
                {formatFullPostDate(post.createdAt)}
            </time>
            <PostActions />
        </article>
    );
}

// Shown while the post loads; the shape of PostDetail, so nothing jumps
export function PostDetailFallback() {
    return (
        <Card className="gap-0 p-0" aria-hidden>
            <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="size-10 shrink-0 rounded-full" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-36 rounded-full" />
                        <Skeleton className="h-3.5 w-24 rounded-full" />
                    </div>
                </div>
                <Skeleton className="h-3.5 w-full rounded-full" />
                <Skeleton className="h-3.5 w-48 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
            </div>
        </Card>
    );
}
