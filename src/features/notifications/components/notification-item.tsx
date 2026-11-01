"use client";

import { useState } from "react";
import Link from "next/link";
import { Chip } from "@heroui/react";
import {
    AtSign,
    Heart,
    MessageCircle,
    Sword,
    Swords,
    UserPlus,
} from "lucide-react";
import { RelativeTime } from "@/components/ui/relative-time";
import { UserAvatar } from "@/components/ui/user-avatar";
import { CHALLENGES_PATH } from "@/features/challenges/utils/challenge-path";
import { MATCHES_PATH } from "@/features/matches/utils/match-path";
import {
    formatPlayedAt,
    formatSet,
} from "@/features/matches/utils/match-score";
import { TextWithMentions } from "@/features/mentions/components/text-with-mentions";
import type { ChallengeState } from "@/features/challenges/utils/challenge-rules";
import type { UserNotification } from "@/features/notifications/lib/queries";
import { ClickablePost } from "@/features/posts/components/clickable-post";
import { postPath } from "@/features/posts/utils/post-path";
import { profilePath } from "@/features/profile/utils/profile-path";

const TYPE_ICONS = {
    REPLY: { icon: MessageCircle, className: "text-foreground" },
    // Like a liked post's heart
    LIKE: { icon: Heart, className: "fill-current text-danger" },
    MENTION: { icon: AtSign, className: "text-foreground" },
    FOLLOW: { icon: UserPlus, className: "text-foreground" },
    // The icon of Matches in the nav; the text says what happened
    MATCH_REQUEST: { icon: Swords, className: "text-foreground" },
    MATCH_CONFIRMED: { icon: Swords, className: "text-foreground" },
    MATCH_DECLINED: { icon: Swords, className: "text-foreground" },
    MATCH_WITHDRAWN: { icon: Swords, className: "text-foreground" },
    MATCH_UPDATED: { icon: Swords, className: "text-foreground" },
    // The icon of Challenges in the nav
    CHALLENGE_REQUEST: { icon: Sword, className: "text-foreground" },
    CHALLENGE_ACCEPTED: { icon: Sword, className: "text-foreground" },
    CHALLENGE_DECLINED: { icon: Sword, className: "text-foreground" },
    CHALLENGE_WITHDRAWN: { icon: Sword, className: "text-foreground" },
};

// How a match the user was asked to confirm was answered, after its score
const MATCH_STATUS_LABELS = {
    PENDING: null,
    CONFIRMED: "Confirmed",
    DECLINED: "Declined",
    WITHDRAWN: "Withdrawn",
};

// What's become of a challenge the user received, after its deadline, like
// the table's status. Open ones need no label: the deadline says it.
function challengeStateLabel({
    state,
    won,
}: {
    state: ChallengeState;
    won: boolean | null;
}) {
    switch (state) {
        case "open":
            return null;
        case "accepted":
            return "Accepted";
        case "declined":
            return "Declined";
        case "withdrawn":
            return "Withdrawn";
        case "expired":
            return "Passed";
        case "played":
            return won ? "Won" : "Lost";
    }
}

// E.g. "Nov 8, 2026, 14:00", in the user's time zone
const deadlineFormat = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    hourCycle: "h23",
});

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
        case "MATCH_REQUEST":
            return "logged a match against you";
        case "MATCH_CONFIRMED":
            return "confirmed your match";
        case "MATCH_DECLINED":
            return "declined your match";
        case "MATCH_WITHDRAWN":
            return "withdrew their match against you";
        case "MATCH_UPDATED":
            return "changed the match against you";
        case "CHALLENGE_REQUEST":
            return "challenged you to a match";
        case "CHALLENGE_ACCEPTED":
            return "accepted your challenge";
        case "CHALLENGE_DECLINED":
            return "declined your challenge";
        case "CHALLENGE_WITHDRAWN":
            return "withdrew their challenge";
    }
}

// The text below the actor's name
function NotificationText({
    notification,
}: {
    notification: UserNotification;
}) {
    switch (notification.type) {
        // Who the new follower is
        case "FOLLOW":
            return (
                <p className="truncate text-sm text-muted">
                    @{notification.actor.username}
                </p>
            );
        // The day and score from the user's side, as they are now. A request
        // or change also says how it was answered, as it stays after that.
        case "MATCH_REQUEST":
        case "MATCH_CONFIRMED":
        case "MATCH_DECLINED":
        case "MATCH_WITHDRAWN":
        case "MATCH_UPDATED": {
            const { match } = notification;
            if (!match) {
                return (
                    <p className="text-sm text-muted">The match was deleted.</p>
                );
            }
            const statusLabel =
                notification.type === "MATCH_REQUEST" ||
                notification.type === "MATCH_UPDATED"
                    ? MATCH_STATUS_LABELS[match.status]
                    : null;
            return (
                <p className="mt-1 text-sm tabular-nums">
                    <span className="text-muted">
                        {formatPlayedAt(match.playedAt)}
                        {" · "}
                    </span>
                    {match.sets.map(formatSet).join(" ")}
                    {statusLabel && (
                        <span className="text-muted">
                            {" · "}
                            {statusLabel}
                        </span>
                    )}
                </p>
            );
        }
        // The deadline. A request also says what's become of it, as it
        // stays after it was answered. The server renders the time in its
        // own time zone, so React doesn't warn when the browser's differs.
        case "CHALLENGE_REQUEST":
        case "CHALLENGE_ACCEPTED":
        case "CHALLENGE_DECLINED":
        case "CHALLENGE_WITHDRAWN": {
            const { challenge } = notification;
            const stateLabel =
                notification.type === "CHALLENGE_REQUEST"
                    ? challengeStateLabel(challenge)
                    : null;
            return (
                <p className="mt-1 text-sm text-muted">
                    Deadline{" "}
                    <time
                        suppressHydrationWarning
                        dateTime={challenge.deadline.toISOString()}
                    >
                        {deadlineFormat.format(challenge.deadline)}
                    </time>
                    {stateLabel && ` · ${stateLabel}`}
                </p>
            );
        }
        // The liked text is the user's own, so it's muted; replies and
        // mentions are new to them
        default:
            return (
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
            );
    }
}

// Where a notification leads: the post, the follower's profile, or for a
// match or challenge their page
function notificationHref(notification: UserNotification) {
    switch (notification.type) {
        case "FOLLOW":
            return profilePath(notification.actor.username);
        case "MATCH_REQUEST":
        case "MATCH_CONFIRMED":
        case "MATCH_DECLINED":
        case "MATCH_WITHDRAWN":
        case "MATCH_UPDATED":
            return MATCHES_PATH;
        case "CHALLENGE_REQUEST":
        case "CHALLENGE_ACCEPTED":
        case "CHALLENGE_DECLINED":
        case "CHALLENGE_WITHDRAWN":
            return CHALLENGES_PATH;
        default:
            return postPath(notification.postId);
    }
}

// Marks a notification the user hadn't seen before this visit. Clicking it
// fades it out and removes it.
function NewBadge({ onDismiss }: { onDismiss: () => void }) {
    const [isFading, setIsFading] = useState(false);
    return (
        <button
            type="button"
            aria-label="New, dismiss"
            onClick={() => setIsFading(true)}
            onTransitionEnd={(event) => {
                if (event.propertyName === "opacity") {
                    onDismiss();
                }
            }}
            className={`shrink-0 cursor-pointer self-start rounded-full transition-opacity duration-700 ${
                isFading ? "opacity-0" : ""
            }`}
        >
            <Chip size="sm" color="accent" variant="primary">
                New
            </Chip>
        </button>
    );
}

// One notification: what kind it is, who did it, and the text it's about.
// Like a post in a feed, all of it leads to the post, or for a follow to
// the follower's profile and for a match or challenge to their page (see
// ClickablePost),
// and its time is the link for keyboards and screen readers.
// `isNew` shows the "New" badge on the right, which `onDismissNew` hides.
export function NotificationItem({
    notification,
    isNew,
    onDismissNew,
}: {
    notification: UserNotification;
    isNew: boolean;
    onDismissNew: () => void;
}) {
    const { actor } = notification;
    const { icon: Icon, className: iconClassName } =
        TYPE_ICONS[notification.type];
    const profileHref = profilePath(actor.username);
    const href = notificationHref(notification);

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
                        <RelativeTime date={notification.createdAt} />
                    </Link>
                </p>
                <NotificationText notification={notification} />
            </div>
            {isNew && <NewBadge onDismiss={onDismissNew} />}
        </ClickablePost>
    );
}
