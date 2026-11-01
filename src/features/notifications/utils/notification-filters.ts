// The filters above the notifications on /notifications. They run in the
// database query, as the list is paged; this file has no database access,
// so the list can use it too.

// The options of the Type filter menu. `types` are the notification types
// each one shows.
export const NOTIFICATION_TYPE_FILTERS = [
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
        types: [
            "MATCH_REQUEST",
            "MATCH_CONFIRMED",
            "MATCH_DECLINED",
            "MATCH_WITHDRAWN",
            "MATCH_UPDATED",
        ],
        emptyMessage: "No match requests or answers yet.",
    },
    {
        key: "challenges",
        label: "Challenges",
        types: [
            "CHALLENGE_REQUEST",
            "CHALLENGE_ACCEPTED",
            "CHALLENGE_DECLINED",
            "CHALLENGE_WITHDRAWN",
        ],
        emptyMessage: "No challenges or answers yet.",
    },
] as const;

export type NotificationTypeFilter =
    (typeof NOTIFICATION_TYPE_FILTERS)[number]["key"];

export const NOTIFICATION_TYPE_KEYS = NOTIFICATION_TYPE_FILTERS.map(
    ({ key }) => key,
);

// The options of the Show filter menu: every notification, or only the new
// ones
export const NOTIFICATION_SHOW_FILTERS = [
    { key: "all", label: "All notifications" },
    { key: "new", label: "New" },
] as const;

export type NotificationShowFilter =
    (typeof NOTIFICATION_SHOW_FILTERS)[number]["key"];

export const NOTIFICATION_SHOW_KEYS = NOTIFICATION_SHOW_FILTERS.map(
    ({ key }) => key,
);

export type NotificationFilters = {
    // Empty shows every type
    types: NotificationTypeFilter[];
    show: NotificationShowFilter;
};

export const NO_NOTIFICATION_FILTERS: NotificationFilters = {
    types: [],
    show: "all",
};

// The notification types the filters show, or null for all of them
export function notificationTypes(filters: NotificationFilters) {
    if (filters.types.length === 0) {
        return null;
    }
    return NOTIFICATION_TYPE_FILTERS.filter(({ key }) =>
        filters.types.includes(key),
    ).flatMap(({ types }) => types);
}

// How many filters are set, for Clear filters: each type counts as one,
// and showing only new ones too
export function countActiveNotificationFilters(filters: NotificationFilters) {
    return filters.types.length + (filters.show === "new" ? 1 : 0);
}

// The same text for the same filters, whatever order they were ticked in,
// to keep the loaded pages of each combination apart
export function notificationFiltersKey(filters: NotificationFilters) {
    return JSON.stringify({
        types: [...filters.types].sort(),
        show: filters.show,
    });
}

// What the list says when nothing fits the filters
export function notificationsEmptyMessage(filters: NotificationFilters) {
    const [onlyType] = filters.types;
    const isOneType = filters.types.length === 1;
    if (filters.show === "new") {
        if (filters.types.length === 0) {
            return "No new notifications.";
        }
        return isOneType
            ? "No new notifications of this type."
            : "No new notifications of these types.";
    }
    if (filters.types.length === 0) {
        return "No notifications yet. Follows, replies, likes, mentions, matches and challenges will show up here.";
    }
    return isOneType
        ? NOTIFICATION_TYPE_FILTERS.find(({ key }) => key === onlyType)!
              .emptyMessage
        : "No notifications of these types yet.";
}
