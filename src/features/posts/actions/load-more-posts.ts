"use server";

import { requireSession } from "@/features/auth/lib/session";
import { getFeedPage } from "@/features/posts/lib/queries";
import type { Feed, FeedCursor } from "@/features/posts/utils/feed";

const UUID_PATTERN = /^[0-9a-f-]{36}$/i;

// The page after `cursor`. Checks its arguments: actions can be called
// with anything, not just what the feed component sends.
export async function loadMorePosts(feed: unknown, cursor: unknown) {
    await requireSession();

    if (!isFeed(feed) || !isFeedCursor(cursor)) {
        throw new Error("Invalid feed or cursor");
    }
    return getFeedPage(feed, cursor);
}

function isFeed(value: unknown): value is Feed {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const { type, authorId } = value as Record<string, unknown>;
    return (
        type === "home" ||
        (type === "user" &&
            typeof authorId === "string" &&
            UUID_PATTERN.test(authorId))
    );
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
        UUID_PATTERN.test(id)
    );
}
