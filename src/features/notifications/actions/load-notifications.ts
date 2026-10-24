"use server";

import { requireSession } from "@/features/auth/lib/session";
import { getNotificationsPage } from "@/features/notifications/lib/queries";
import { isNotificationFilter } from "@/features/notifications/utils/notification-filters";
import { isFeedCursor } from "@/features/posts/utils/feed";

// A page of the signed-in user's notifications for a tab: the first one
// without a cursor (when the tab opens), or the one after `cursor`. Checks
// its arguments: actions can be called with anything, not just what the
// list sends.
export async function loadNotifications(filter: unknown, cursor: unknown) {
    const { user } = await requireSession();

    if (
        !isNotificationFilter(filter) ||
        !(cursor === null || isFeedCursor(cursor))
    ) {
        throw new Error("Invalid filter or cursor");
    }
    return getNotificationsPage(user.id, filter, cursor ?? undefined);
}
