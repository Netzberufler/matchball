import "server-only";

import type { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";
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

// Only what a notification shows. The actor, post and comment each come in
// one query per page, by primary key.
const notificationSelect = {
    id: true,
    type: true,
    createdAt: true,
    actor: { select: { username: true, name: true, image: true } },
    post: { select: { id: true, content: true, mentions: mentionsSelect } },
    comment: {
        select: { content: true, parentId: true, mentions: mentionsSelect },
    },
} satisfies Prisma.NotificationSelect;

type NotificationRow = Prisma.NotificationGetPayload<{
    select: typeof notificationSelect;
}>;

// A follow links to the follower's profile and shows no text; the other
// kinds are about a post or reply
export type UserNotification = {
    id: string;
    createdAt: Date;
    actor: NotificationRow["actor"];
} & (
    | { type: "FOLLOW" }
    | {
          type: Exclude<NotificationRow["type"], "FOLLOW">;
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

function toUserNotification({
    post,
    comment,
    ...notification
}: NotificationRow): UserNotification {
    // Only follows are about no post
    if (notification.type === "FOLLOW" || post === null) {
        return { ...notification, type: "FOLLOW" };
    }
    const shown = comment ?? post;
    // A new reply answers a reply if it has a parent, the post otherwise.
    // Likes and mentions are about the reply if there is one.
    const isAboutReply =
        notification.type === "REPLY"
            ? comment?.parentId != null
            : comment !== null;
    return {
        ...notification,
        postId: post.id,
        target: isAboutReply ? "reply" : "post",
        text: shown.content,
        mentions: toUsernames(shown.mentions),
    };
}

// One page of the user's notifications, all or of the filter's type, newest
// first with id breaking ties. Reads the Notification (userId, createdAt,
// id) index in order, or (userId, type, createdAt, id) for a type.
export async function getNotificationsPage(
    userId: string,
    filter: NotificationFilter,
    cursor?: FeedCursor,
): Promise<FeedPage<UserNotification>> {
    const { type } = getNotificationFilter(filter);
    const where = { userId, ...(type && { type }) };
    // One extra notification tells whether there is another page
    const notifications = await prisma.notification.findMany({
        where: cursor ? { ...where, ...olderThan(cursor) } : where,
        select: notificationSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: FEED_PAGE_SIZE + 1,
    });
    return toPage(notifications.map(toUserNotification));
}
