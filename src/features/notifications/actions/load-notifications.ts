"use server";

import { z } from "zod";
import { requireSession } from "@/features/auth/lib/session";
import { getNotificationsPage } from "@/features/notifications/lib/queries";
import {
    NOTIFICATION_SHOW_KEYS,
    NOTIFICATION_TYPE_KEYS,
} from "@/features/notifications/utils/notification-filters";
import { feedCursorSchema, parseActionInput } from "@/lib/action-input";

// The filters above the list, rebuilt from their two fields
const filtersSchema = z.object({
    types: z
        .array(z.enum(NOTIFICATION_TYPE_KEYS))
        .max(NOTIFICATION_TYPE_KEYS.length),
    show: z.enum(NOTIFICATION_SHOW_KEYS),
});

// A page of the signed-in user's notifications that `filtersInput` show:
// the first one without a cursor (when the filters change), or the one
// after `cursor`, for "Load more". Showing only new ones keeps those seen
// since `newSinceInput`, when the visit started. Checks its arguments:
// actions can be called with anything, not just what the list sends.
export async function loadNotifications(
    filtersInput: unknown,
    cursorInput: unknown,
    newSinceInput: unknown,
) {
    const { user } = await requireSession();

    const filters = parseActionInput(filtersSchema, filtersInput);
    const cursor = parseActionInput(feedCursorSchema.nullable(), cursorInput);
    const newSince = parseActionInput(z.date(), newSinceInput);
    return getNotificationsPage(
        user.id,
        filters,
        cursor ?? undefined,
        newSince,
    );
}
