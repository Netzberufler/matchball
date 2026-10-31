"use server";

import { requireSession } from "@/features/auth/lib/session";
import { getConversationsPage } from "@/features/messages/lib/queries";
import { feedCursorSchema, parseActionInput } from "@/lib/action-input";

// A page of the signed-in user's conversations on /messages: the one after
// the cursor, or with null, the first (the latest conversations)
export async function loadConversations(cursorInput: unknown) {
    const { user } = await requireSession();

    // Checked here: actions can be called with anything
    const cursor = parseActionInput(feedCursorSchema.nullable(), cursorInput);
    return getConversationsPage(user.id, cursor ?? undefined);
}
