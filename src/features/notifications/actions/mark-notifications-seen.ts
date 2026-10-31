"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/features/auth/lib/session";
import { markNotificationsRead } from "@/features/notifications/lib/queries";
import { idSchema, parseActionInput } from "@/lib/action-input";

// At most a few pages' worth; the list sends what scrolled into view
const idsSchema = z.array(idSchema).min(1).max(100);

// Marks the signed-in user's notifications with these ids as seen, when
// they were shown on /notifications. Checks its argument: actions can be
// called with anything, not just what the list sends.
export async function markNotificationsSeen(idsInput: unknown) {
    const { user } = await requireSession();

    const ids = parseActionInput(idsSchema, idsInput);
    const count = await markNotificationsRead(user.id, ids);
    // Updates the count of new notifications in the nav
    if (count > 0) {
        refresh();
    }
}
