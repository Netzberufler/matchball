import Link from "next/link";
import { RelativeTime } from "@/components/ui/relative-time";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { PostComment } from "@/features/comments/lib/queries";
import { profilePath } from "@/features/profile/utils/profile-path";
import { TextWithMentions } from "@/features/mentions/components/text-with-mentions";

// One comment under a post, laid out like a post in a feed, with its
// buttons (`actions`) below the text
export function CommentItem({
    comment,
    actions,
    className,
}: {
    comment: PostComment;
    actions: React.ReactNode;
    className?: string;
}) {
    const { author } = comment;
    const profileHref = profilePath(author.username);

    return (
        <article className={`flex gap-3 ${className ?? "p-4"}`}>
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
                    {/* The relative time can differ between the server and
                        the browser, e.g. "4m" and "5m" */}
                    <RelativeTime
                        date={comment.createdAt}
                        className="shrink-0 text-muted"
                    />
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words">
                    <TextWithMentions
                        text={comment.content}
                        mentions={comment.mentions}
                    />
                </p>
                <div className="-ml-2 mt-2 flex items-center gap-6">
                    {actions}
                </div>
            </div>
        </article>
    );
}
