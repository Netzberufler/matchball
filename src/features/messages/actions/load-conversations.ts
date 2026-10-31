"use server";

import { requireSession } from "@/features/auth/lib/session";
import { getConversationsPage } from "@/features/messages/lib/queries";
import { feedCursorSchema, parseActionInput } from "@/lib/action-input";

// The next page of the signed-in user's conversations on /messages
export async function loadConversations(cursorInput: unknown) {
    const { user } = await requireSession();

    // Checked here: actions can be called with anything
    const cursor = parseActionInput(feedCursorSchema, cursorInput);
    return getConversationsPage(user.id, cursor);
}
