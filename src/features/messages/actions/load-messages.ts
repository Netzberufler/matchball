"use server";

import { refresh } from "next/cache";
import { requireSession } from "@/features/auth/lib/session";
import {
    findConversationId,
    getMessagesPage,
    getNewerMessages,
    markMessagesRead,
} from "@/features/messages/lib/queries";
import {
    feedCursorSchema,
    idSchema,
    parseActionInput,
} from "@/lib/action-input";

// The older messages of the conversation with a user, above the ones
// shown. Only the signed-in user's own conversations are found.
export async function loadOlderMessages(
    partnerIdInput: unknown,
    cursorInput: unknown,
) {
    const { user } = await requireSession();

    // Checked here: actions can be called with anything
    const partnerId = parseActionInput(idSchema, partnerIdInput);
    const cursor = parseActionInput(feedCursorSchema, cursorInput);
    const conversationId = await findConversationId(user.id, partnerId);
    if (!conversationId) {
        return { items: [], nextCursor: null };
    }
    return getMessagesPage(conversationId, user.id, cursor);
}

// The messages sent after the latest one shown (the cursor; null if none
// is shown yet), for an open conversation that checks for new ones. The
// received ones count as read now, since the conversation shows them.
export async function loadNewMessages(
    partnerIdInput: unknown,
    cursorInput: unknown,
) {
    const { user } = await requireSession();

    // Checked here: actions can be called with anything
    const partnerId = parseActionInput(idSchema, partnerIdInput);
    const cursor = parseActionInput(feedCursorSchema.nullable(), cursorInput);
    const conversationId = await findConversationId(user.id, partnerId);
    if (!conversationId) {
        return [];
    }
    const messages = await getNewerMessages(conversationId, user.id, cursor);
    if (messages.some((message) => !message.isOwn)) {
        const count = await markMessagesRead(conversationId, user.id);
        // Updates the count of unread messages in the nav
        if (count > 0) {
            refresh();
        }
    }
    return messages;
}

// Marks the messages the signed-in user received from a user as read, when
// their conversation was opened
export async function markConversationRead(partnerIdInput: unknown) {
    const { user } = await requireSession();

    const partnerId = parseActionInput(idSchema, partnerIdInput);
    const conversationId = await findConversationId(user.id, partnerId);
    if (!conversationId) {
        return;
    }
    const count = await markMessagesRead(conversationId, user.id);
    // Updates the count of unread messages in the nav
    if (count > 0) {
        refresh();
    }
}
