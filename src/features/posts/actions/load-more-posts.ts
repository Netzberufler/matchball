"use server";

import { requireSession } from "@/features/auth/lib/session";
import { getFeedPage } from "@/features/posts/lib/queries";
import {
    FEED_TYPES,
    type FeedCursor,
    type FeedType,
} from "@/features/posts/utils/feed";

// The page after `cursor`. Checks its arguments: actions can be called
// with anything, not just what the feed component sends.
export async function loadMorePosts(feed: unknown, cursor: unknown) {
    const { user } = await requireSession();

    if (!isFeedType(feed) || !isFeedCursor(cursor)) {
        throw new Error("Invalid feed or cursor");
    }
    return getFeedPage(feed, user.id, cursor);
}

function isFeedType(value: unknown): value is FeedType {
    return FEED_TYPES.some((type) => type === value);
}

function isFeedCursor(value: unknown): value is FeedCursor {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const { createdAt, id } = value as Record<string, unknown>;
    return (
        createdAt instanceof Date &&
        !Number.isNaN(createdAt.getTime()) &&
        typeof id === "string" &&
        /^[0-9a-f-]{36}$/i.test(id)
    );
}
