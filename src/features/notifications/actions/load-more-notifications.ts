"use server";

import { requireSession } from "@/features/auth/lib/session";
import { getNotificationsPage } from "@/features/notifications/lib/queries";
import { isFeedCursor } from "@/features/posts/utils/feed";

// The page of the signed-in user's notifications after `cursor`. Checks it:
// actions can be called with anything, not just what the list sends.
export async function loadMoreNotifications(cursor: unknown) {
    const { user } = await requireSession();

    if (!isFeedCursor(cursor)) {
        throw new Error("Invalid cursor");
    }
    return getNotificationsPage(user.id, cursor);
}
