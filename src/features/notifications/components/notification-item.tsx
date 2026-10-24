import Link from "next/link";
import { AtSign, Heart, MessageCircle, UserPlus } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { TextWithMentions } from "@/features/mentions/components/text-with-mentions";
import type { UserNotification } from "@/features/notifications/lib/queries";
import { ClickablePost } from "@/features/posts/components/clickable-post";
import {
    formatFullPostDate,
    formatPostDate,
} from "@/features/posts/utils/format-post-date";
import { postPath } from "@/features/posts/utils/post-path";
import { profilePath } from "@/features/profile/utils/profile-path";

const TYPE_ICONS = {
    REPLY: { icon: MessageCircle, className: "text-accent" },
    // Like a liked post's heart
    LIKE: { icon: Heart, className: "fill-current text-danger" },
    MENTION: { icon: AtSign, className: "text-accent" },
    FOLLOW: { icon: UserPlus, className: "text-accent" },
};

// What the actor did, after their name
function describeAction(notification: UserNotification) {
    switch (notification.type) {
        case "REPLY":
            return `replied to your ${notification.target}`;
        case "LIKE":
            return `liked your ${notification.target}`;
        case "MENTION":
            return `mentioned you in a ${notification.target}`;
        case "FOLLOW":
            return "followed you";
    }
}

// One notification: what kind it is, who did it, and the text it's about.
// Like a post in a feed, all of it leads to the post, or for a follow to
// the follower's profile (see ClickablePost), and its time is the link for
// keyboards and screen readers.
export function NotificationItem({
    notification,
}: {
    notification: UserNotification;
}) {
    const { actor } = notification;
    const { icon: Icon, className: iconClassName } =
        TYPE_ICONS[notification.type];
    const profileHref = profilePath(actor.username);
    const href =
        notification.type === "FOLLOW"
            ? profileHref
            : postPath(notification.postId);

    return (
        <ClickablePost
            href={href}
            // The hover colour of posts in the feeds
            className="flex gap-3 p-4 transition-colors hover:bg-surface-secondary/60"
        >
            {/* What happened; the text says it too. As tall as the avatar,
                to center the icon beside it. */}
            <div className="mr-2 flex h-10 shrink-0 items-center">
                <Icon className={`size-5 ${iconClassName}`} aria-hidden />
            </div>
            {/* Same target as the name link, so only that one is focusable
                and announced */}
            <Link
                href={profileHref}
                tabIndex={-1}
                aria-hidden
                className="shrink-0 self-start rounded-full transition-opacity hover:opacity-80"
            >
                <UserAvatar name={actor.name} image={actor.image} />
            </Link>
            <div className="min-w-0 flex-1">
                <p className="text-sm">
                    <Link
                        href={profileHref}
                        className="font-semibold text-foreground hover:underline"
                    >
                        {actor.name}
                    </Link>{" "}
                    {describeAction(notification)}
                    <span className="text-muted" aria-hidden>
                        {" · "}
                    </span>
                    <Link href={href} className="text-muted hover:underline">
                        {/* The relative time can differ between the server
                            and the browser, e.g. "4m" and "5m" */}
                        <time
                            suppressHydrationWarning
                            dateTime={notification.createdAt.toISOString()}
                            title={formatFullPostDate(notification.createdAt)}
                        >
                            {formatPostDate(notification.createdAt)}
                        </time>
                    </Link>
                </p>
                {/* Follows show who the new follower is, without text. The
                    liked text is the user's own, so it's muted; replies and
                    mentions are new to them. */}
                {notification.type === "FOLLOW" ? (
                    <p className="truncate text-sm text-muted">
                        @{actor.username}
                    </p>
                ) : (
                    <p
                        className={`mt-1 whitespace-pre-wrap break-words ${
                            notification.type === "LIKE" ? "text-muted" : ""
                        }`}
                    >
                        <TextWithMentions
                            text={notification.text}
                            mentions={notification.mentions}
                        />
                    </p>
                )}
            </div>
        </ClickablePost>
    );
}
