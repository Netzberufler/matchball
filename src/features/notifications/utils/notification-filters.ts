// The tabs on /notifications. Shared by the query, the actions and the tabs.
// `type` is the only notification type a tab shows; null shows them all.
export const NOTIFICATION_FILTERS = [
    {
        key: "all",
        label: "All",
        type: null,
        emptyMessage:
            "No notifications yet. Follows, replies, likes and mentions will show up here.",
    },
    {
        key: "followers",
        label: "Followers",
        type: "FOLLOW",
        emptyMessage: "No new followers yet.",
    },
    {
        key: "mentions",
        label: "Mentions",
        type: "MENTION",
        emptyMessage: "Nobody has mentioned you yet.",
    },
    {
        key: "replies",
        label: "Replies",
        type: "REPLY",
        emptyMessage: "Nobody has replied to you yet.",
    },
    {
        key: "likes",
        label: "Likes",
        type: "LIKE",
        emptyMessage: "Nobody has liked your posts or replies yet.",
    },
] as const;

export type NotificationFilter = (typeof NOTIFICATION_FILTERS)[number]["key"];

export function isNotificationFilter(
    value: unknown,
): value is NotificationFilter {
    return NOTIFICATION_FILTERS.some((filter) => filter.key === value);
}

export function getNotificationFilter(key: NotificationFilter) {
    return NOTIFICATION_FILTERS.find((filter) => filter.key === key)!;
}
