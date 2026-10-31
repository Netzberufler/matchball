"use server";

import { requireSession } from "@/features/auth/lib/session";
import { countUnreadMessages } from "@/features/messages/lib/queries";

// How many messages to the signed-in user are unread, for the nav to check
// now and then
export async function getUnreadMessageCount() {
    const { user } = await requireSession();
    return countUnreadMessages(user.id);
}
