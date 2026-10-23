import Link from "next/link";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { FeedPost } from "@/features/posts/lib/queries";
import {
    formatFullPostDate,
    formatPostDate,
} from "@/features/posts/utils/format-post-date";
import { postPath } from "@/features/posts/utils/post-path";
import { profilePath } from "@/features/profile/utils/profile-path";
import { ClickablePost } from "./clickable-post";
import { PostActions } from "./post-actions";

// A post in a feed. The whole post leads to its own page (see
// ClickablePost), and its time is the link to it for keyboards and screen
// readers. Links can't contain links, which is why the post isn't simply
// wrapped in one. On its own page, a post is shown as PostDetail.
export function PostItem({ post }: { post: FeedPost }) {
    const { author } = post;
    const profileHref = profilePath(author.username);
    const href = postPath(post.id);

    return (
        <ClickablePost
            href={href}
            // The hover colour of HeroUI's Table rows: there a white cell
            // turns 40% opaque over surface-secondary; here the post sits on
            // white, so it's surface-secondary at 60%
            className="flex gap-3 p-4 transition-colors hover:bg-surface-secondary/60"
        >
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
                    <Link
                        href={href}
                        className="shrink-0 text-muted hover:underline"
                    >
                        {/* The relative time can differ between the server
                            and the browser, e.g. "4m" and "5m" */}
                        <time
                            suppressHydrationWarning
                            dateTime={post.createdAt.toISOString()}
                            title={formatFullPostDate(post.createdAt)}
                        >
                            {formatPostDate(post.createdAt)}
                        </time>
                    </Link>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words">
                    {post.content}
                </p>
                <PostActions post={post} className="mt-2" />
            </div>
        </ClickablePost>
    );
}
