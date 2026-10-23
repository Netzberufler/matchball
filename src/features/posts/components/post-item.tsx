import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { Button } from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { FeedPost } from "@/features/posts/lib/queries";
import {
    formatFullPostDate,
    formatPostDate,
} from "@/features/posts/utils/format-post-date";
import { postPath } from "@/features/posts/utils/post-path";
import { profilePath } from "@/features/profile/utils/profile-path";
import { ClickablePost } from "./clickable-post";

// With linkToPost, the whole post leads to its own page (see ClickablePost),
// and its time is the link to it for keyboards and screen readers. Links
// can't contain links, which is why the post isn't simply wrapped in one.
export function PostItem({
    post,
    linkToPost = true,
}: {
    post: FeedPost;
    linkToPost?: boolean;
}) {
    const { author } = post;
    const profileHref = profilePath(author.username);

    // The relative time can differ between the server and the browser,
    // e.g. "4m" and "5m"
    const time = (
        <time
            suppressHydrationWarning
            dateTime={post.createdAt.toISOString()}
            title={formatFullPostDate(post.createdAt)}
        >
            {formatPostDate(post.createdAt)}
        </time>
    );

    const content = (
        <>
            {/* Same target as the name link, so only that one is focusable
                and announced */}
            <Link
                href={profileHref}
                tabIndex={-1}
                aria-hidden
                className="shrink-0 self-start rounded-full transition-opacity hover:opacity-80"
            >
                <UserAvatar name={author.name} image={author.image} />
            </Link>
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1 text-sm">
                    <Link
                        href={profileHref}
                        className="group flex min-w-0 items-baseline gap-1"
                    >
                        <span className="truncate font-semibold text-foreground group-hover:underline">
                            {author.name}
                        </span>
                        {/* Spaces the link text for screen readers; flex
                            gap does the visual spacing */}{" "}
                        <span className="truncate text-muted">
                            @{author.username}
                        </span>
                    </Link>
                    <span className="text-muted" aria-hidden>
                        ·
                    </span>
                    {linkToPost ? (
                        <Link
                            href={postPath(post.id)}
                            className="shrink-0 text-muted hover:underline"
                        >
                            {time}
                        </Link>
                    ) : (
                        <span className="shrink-0 text-muted">{time}</span>
                    )}
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
        </>
    );

    return linkToPost ? (
        <ClickablePost
            href={postPath(post.id)}
            // The hover colour of HeroUI's Table rows: there a white cell
            // turns 40% opaque over surface-secondary; here the post sits on
            // white, so it's surface-secondary at 60%
            className="flex gap-3 p-4 transition-colors hover:bg-surface-secondary/60"
        >
            {content}
        </ClickablePost>
    ) : (
        <article className="flex gap-3 p-4">{content}</article>
    );
}
