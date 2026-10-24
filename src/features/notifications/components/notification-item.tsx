import Link from "next/link";
import { AtSign, Heart, MessageCircle } from "lucide-react";
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

const TYPE_DISPLAY = {
    REPLY: {
        icon: MessageCircle,
        iconClassName: "text-accent",
        action: (target: string) => `replied to your ${target}`,
    },
    LIKE: {
        icon: Heart,
        // Like a liked post's heart
        iconClassName: "fill-current text-danger",
        action: (target: string) => `liked your ${target}`,
    },
    MENTION: {
        icon: AtSign,
        iconClassName: "text-accent",
        action: (target: string) => `mentioned you in a ${target}`,
    },
};

// One notification: what kind it is, who did it, and the text it's about.
// Like a post in a feed, all of it leads to the post (see ClickablePost),
// and its time is the link for keyboards and screen readers.
export function NotificationItem({
    notification,
}: {
    notification: UserNotification;
}) {
    const { actor } = notification;
    const display = TYPE_DISPLAY[notification.type];
    const Icon = display.icon;
    const profileHref = profilePath(actor.username);
    const href = postPath(notification.postId);

    return (
        <ClickablePost
            href={href}
            // The hover colour of posts in the feeds
            className="flex gap-3 p-4 transition-colors hover:bg-surface-secondary/60"
        >
            {/* As wide as an avatar, so the texts line up with posts */}
            <div className="flex w-10 shrink-0 justify-end pt-2">
                <Icon
                    className={`size-6 ${display.iconClassName}`}
                    aria-hidden
                />
            </div>
            <div className="min-w-0 flex-1">
                {/* Same target as the name link, so only that one is
                    focusable and announced */}
                <Link
                    href={profileHref}
                    tabIndex={-1}
                    aria-hidden
                    className="inline-block rounded-full transition-opacity hover:opacity-80"
                >
                    <UserAvatar name={actor.name} image={actor.image} />
                </Link>
                <p className="mt-2 text-sm">
                    <Link
                        href={profileHref}
                        className="font-semibold text-foreground hover:underline"
                    >
                        {actor.name}
                    </Link>{" "}
                    {display.action(notification.target)}
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
                {/* The liked text is the user's own, so it's muted; replies
                    and mentions are new to them */}
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
            </div>
        </ClickablePost>
    );
}
