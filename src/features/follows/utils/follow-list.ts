// Shared by the follow list queries, the loadMoreFollows action and the list

// "followers": who follows the user; "following": whom the user follows
export const FOLLOW_LIST_KINDS = ["followers", "following"] as const;
export type FollowListKind = (typeof FOLLOW_LIST_KINDS)[number];
