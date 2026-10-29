import "server-only";

import type { MatchStatus, Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";
import { getSets, type SetScore } from "@/features/matches/utils/match-score";
import { mentionsSelect, toUsernames } from "@/features/mentions/lib/queries";
import {
    getNotificationFilter,
    type NotificationFilter,
} from "@/features/notifications/utils/notification-filters";
import {
    FEED_PAGE_SIZE,
    type FeedCursor,
    type FeedPage,
    olderThan,
    toPage,
} from "@/features/posts/utils/feed";

// Only what a notification shows. The actor, post, comment and match each
// come in one query per page, by primary key.
const notificationSelect = {
    id: true,
    type: true,
    createdAt: true,
    userId: true,
    actor: { select: { username: true, name: true, image: true } },
    post: { select: { id: true, content: true, mentions: mentionsSelect } },
    comment: {
        select: { content: true, parentId: true, mentions: mentionsSelect },
    },
    match: {
        select: {
            playedAt: true,
            status: true,
            player1Id: true,
            set1Player1: true,
            set1Player2: true,
            set2Player1: true,
            set2Player2: true,
            set3Player1: true,
            set3Player2: true,
            set3IsMatchTiebreak: true,
        },
    },
} satisfies Prisma.NotificationSelect;

type NotificationRow = Prisma.NotificationGetPayload<{
    select: typeof notificationSelect;
}>;

type MatchNotificationType = Extract<
    NotificationRow["type"],
    `MATCH_${string}`
>;

// A follow links to the follower's profile and shows no text; match
// notifications link to /matches and show the match; the other kinds are
// about a post or reply
export type UserNotification = {
    id: string;
    createdAt: Date;
    actor: NotificationRow["actor"];
} & (
    | { type: "FOLLOW" }
    | {
          type: MatchNotificationType;
          // The sets from the notified user's side, and how the match was
          // answered, e.g. that a request was declined later. Null only for
          // match notifications written before matches were kept.
          match: {
              playedAt: Date;
              sets: SetScore[];
              status: MatchStatus;
          } | null;
      }
    | {
          type: Exclude<
              NotificationRow["type"],
              "FOLLOW" | MatchNotificationType
          >;
          // The post page it links to
          postId: string;
          // What was replied to, liked, or mentioned the user
          target: "post" | "reply";
          // The text shown with it: the new reply, the liked post or
          // reply, or the one with the mention
          text: string;
          // The usernames mentioned in `text` that belong to real users
          mentions: string[];
      }
);

function isMatchNotificationType(
    type: NotificationRow["type"],
): type is MatchNotificationType {
    return type.startsWith("MATCH_");
}

function toUserNotification({
    userId,
    type,
    post,
    comment,
    match,
    ...notification
}: NotificationRow): UserNotification {
    if (isMatchNotificationType(type)) {
        return {
            ...notification,
            type,
            match: match && {
                playedAt: match.playedAt,
                status: match.status,
                sets: getSets(
                    match,
                    match.player1Id === userId ? "player1" : "player2",
                ),
            },
        };
    }
    // Only follows are about no post
    if (type === "FOLLOW" || post === null) {
        return { ...notification, type: "FOLLOW" };
    }
    const shown = comment ?? post;
    // A new reply answers a reply if it has a parent, the post otherwise.
    // Likes and mentions are about the reply if there is one.
    const isAboutReply =
        type === "REPLY" ? comment?.parentId != null : comment !== null;
    return {
        ...notification,
        type,
        postId: post.id,
        target: isAboutReply ? "reply" : "post",
        text: shown.content,
        mentions: toUsernames(shown.mentions),
    };
}

// One page of the user's notifications, all or of the filter's types,
// newest first with id breaking ties. Reads the Notification (userId,
// createdAt, id) index in order, or (userId, type, createdAt, id) for types.
export async function getNotificationsPage(
    userId: string,
    filter: NotificationFilter,
    cursor?: FeedCursor,
): Promise<FeedPage<UserNotification>> {
    const { types } = getNotificationFilter(filter);
    const where = { userId, ...(types && { type: { in: [...types] } }) };
    // One extra notification tells whether there is another page
    const notifications = await prisma.notification.findMany({
        where: cursor ? { ...where, ...olderThan(cursor) } : where,
        select: notificationSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: FEED_PAGE_SIZE + 1,
    });
    return toPage(notifications.map(toUserNotification));
}
