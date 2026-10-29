"use server";

import { z } from "zod";
import { requireSession } from "@/features/auth/lib/session";
import { getNotificationsPage } from "@/features/notifications/lib/queries";
import { NOTIFICATION_FILTERS } from "@/features/notifications/utils/notification-filters";
import { feedCursorSchema, parseActionInput } from "@/lib/action-input";

// One of the tabs' keys
const filterSchema = z.enum(NOTIFICATION_FILTERS.map((filter) => filter.key));

// A page of the signed-in user's notifications for a tab: the first one
// without a cursor (when the tab opens), or the one after `cursor`. Checks
// its arguments: actions can be called with anything, not just what the
// list sends.
export async function loadNotifications(
    filterInput: unknown,
    cursorInput: unknown,
) {
    const { user } = await requireSession();

    const filter = parseActionInput(filterSchema, filterInput);
    const cursor = parseActionInput(feedCursorSchema.nullable(), cursorInput);
    return getNotificationsPage(user.id, filter, cursor ?? undefined);
}
