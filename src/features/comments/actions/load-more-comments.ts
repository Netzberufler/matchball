"use server";

import { requireSession } from "@/features/auth/lib/session";
import { getCommentPage } from "@/features/comments/lib/queries";
import { isFeedCursor } from "@/features/posts/utils/feed";

const UUID_PATTERN = /^[0-9a-f-]{36}$/i;

// The page of a post's comments after `cursor`. Checks its arguments:
// actions can be called with anything, not just what the list sends.
export async function loadMoreComments(postId: unknown, cursor: unknown) {
    const { user } = await requireSession();

    if (
        typeof postId !== "string" ||
        !UUID_PATTERN.test(postId) ||
        !isFeedCursor(cursor)
    ) {
        throw new Error("Invalid post or cursor");
    }
    return getCommentPage(postId, user.id, cursor);
}
