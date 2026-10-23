"use server";

import { requireSession } from "@/features/auth/lib/session";
import { getFollowListPage } from "@/features/follows/lib/queries";
import { isFollowListKind } from "@/features/follows/utils/follow-list";
import { isFeedCursor } from "@/features/posts/utils/feed";

const UUID_PATTERN = /^[0-9a-f-]{36}$/i;

// The page of a follow list after `cursor`. Checks its arguments: actions
// can be called with anything, not just what the list sends.
export async function loadMoreFollows(
    kind: unknown,
    userId: unknown,
    cursor: unknown,
) {
    await requireSession();

    if (
        !isFollowListKind(kind) ||
        typeof userId !== "string" ||
        !UUID_PATTERN.test(userId) ||
        !isFeedCursor(cursor)
    ) {
        throw new Error("Invalid follow list or cursor");
    }
    return getFollowListPage(kind, userId, cursor);
}
