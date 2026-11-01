import "server-only";

import type { MatchStatus, Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";
import {
    type ChallengeState,
    challengeState,
} from "@/features/challenges/utils/challenge-rules";
import { getSets, type SetScore } from "@/features/matches/utils/match-score";
import { mentionsSelect, toUsernames } from "@/features/mentions/lib/queries";
import {
    type NotificationFilters,
    notificationTypes,
} from "@/features/notifications/utils/notification-filters";
import {
    FEED_PAGE_SIZE,
    type FeedCursor,
    type FeedPage,
    olderThan,
    toPage,
} from "@/features/posts/utils/feed";

// Only what a notification shows. The actor, post, comment, match and
// challenge each come in one query per page, by primary key.
const notificationSelect = {
    id: true,
    type: true,
    createdAt: true,
    readAt: true,
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
    challenge: {
        select: {
            deadline: true,
            status: true,
            match: { select: { winnerId: true } },
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

type ChallengeNotificationType = Extract<
    NotificationRow["type"],
    `CHALLENGE_${string}`
>;

// A follow links to the follower's profile and shows no text; match
// notifications link to /matches and show the match; challenge
// notifications link to /challenges and show the challenge; the other
// kinds are about a post or reply
export type UserNotification = {
    id: string;
    createdAt: Date;
    // Not seen on /notifications before it was loaded
    isNew: boolean;
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
          type: ChallengeNotificationType;
          // Its deadline and what's become of it since, e.g. that a
          // challenge the user received was accepted, with `won` once it's
          // played
          challenge: {
              deadline: Date;
              state: ChallengeState;
              won: boolean | null;
          };
      }
    | {
          type: Exclude<
              NotificationRow["type"],
              "FOLLOW" | MatchNotificationType | ChallengeNotificationType
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

function isChallengeNotificationType(
    type: NotificationRow["type"],
): type is ChallengeNotificationType {
    return type.startsWith("CHALLENGE_");
}

// `now` decides whether an open challenge has expired
function toUserNotification(
    {
        userId,
        type,
        post,
        comment,
        match,
        challenge,
        readAt,
        ...rest
    }: NotificationRow,
    now: Date,
): UserNotification {
    const notification = { ...rest, isNew: readAt === null };
    // Challenge notifications are deleted with their challenge, so they
    // always have one
    if (isChallengeNotificationType(type) && challenge) {
        const state = challengeState(challenge.status, challenge.deadline, now);
        return {
            ...notification,
            type,
            challenge: {
                deadline: challenge.deadline,
                state,
                won:
                    state === "played" && challenge.match
                        ? challenge.match.winnerId === userId
                        : null,
            },
        };
    }
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
    // Only follows (and challenges) are about no post
    if (
        type === "FOLLOW" ||
        isChallengeNotificationType(type) ||
        post === null
    ) {
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

// One page of the user's notifications that `filters` show, newest first
// with id breaking ties. Reads the Notification (userId, createdAt, id)
// index in order, or (userId, type, createdAt, id) for types.
// Showing only new ones keeps those seen since `newSince` (the start of
// the visit), so they stay while the list marks them seen.
export async function getNotificationsPage(
    userId: string,
    filters: NotificationFilters,
    cursor?: FeedCursor,
    newSince?: Date,
): Promise<FeedPage<UserNotification>> {
    const types = notificationTypes(filters);
    const where: Prisma.NotificationWhereInput = {
        userId,
        ...(types && { type: { in: types } }),
        ...(filters.show === "new" && {
            OR: [
                { readAt: null },
                ...(newSince ? [{ readAt: { gte: newSince } }] : []),
            ],
        }),
    };
    // One extra notification tells whether there is another page
    const notifications = await prisma.notification.findMany({
        where: cursor ? { AND: [where, olderThan(cursor)] } : where,
        select: notificationSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: FEED_PAGE_SIZE + 1,
    });
    const now = new Date();
    return toPage(
        notifications.map((notification) =>
            toUserNotification(notification, now),
        ),
    );
}

// How many of the user's notifications are new, for the nav. Reads the
// Notification (userId, readAt) index.
export function countNewNotifications(userId: string) {
    return prisma.notification.count({ where: { userId, readAt: null } });
}

// Marks the user's notifications with these ids as seen now. Only the
// user's own and only new ones, so the first time seen stays.
export async function markNotificationsRead(userId: string, ids: string[]) {
    const { count } = await prisma.notification.updateMany({
        where: { id: { in: ids }, userId, readAt: null },
        data: { readAt: new Date() },
    });
    return count;
}
