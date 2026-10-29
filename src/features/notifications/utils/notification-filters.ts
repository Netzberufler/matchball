// The tabs on /notifications. Shared by the query, the actions and the tabs.
// `types` are the notification types a tab shows; null shows them all.
export const NOTIFICATION_FILTERS = [
    {
        key: "all",
        label: "All",
        types: null,
        emptyMessage:
            "No notifications yet. Follows, replies, likes, mentions and matches will show up here.",
    },
    {
        key: "followers",
        label: "Followers",
        types: ["FOLLOW"],
        emptyMessage: "No new followers yet.",
    },
    {
        key: "mentions",
        label: "Mentions",
        types: ["MENTION"],
        emptyMessage: "Nobody has mentioned you yet.",
    },
    {
        key: "replies",
        label: "Replies",
        types: ["REPLY"],
        emptyMessage: "Nobody has replied to you yet.",
    },
    {
        key: "likes",
        label: "Likes",
        types: ["LIKE"],
        emptyMessage: "Nobody has liked your posts or replies yet.",
    },
    {
        key: "matches",
        label: "Matches",
        types: ["MATCH_REQUEST", "MATCH_CONFIRMED", "MATCH_DECLINED"],
        emptyMessage: "No match requests or answers yet.",
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
