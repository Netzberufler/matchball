"use server";

import { requireSession } from "@/features/auth/lib/session";
import type { ChatMessage } from "@/features/messages/lib/queries";
import {
    conversationPair,
    messageContentSchema,
} from "@/features/messages/utils/message-rules";
import { idSchema, parseActionInput } from "@/lib/action-input";
import { formText } from "@/lib/form-validation";
import { prisma } from "@/prisma/db";

// Sends a private message to a user, starting the conversation with them
// if this is its first message. Returns it, to show it right away.
// Messages don't notify; they count as unread in the nav instead.
export async function sendMessage(
    recipientIdInput: unknown,
    formData: FormData,
): Promise<
    { error: string; message?: never } | { error: null; message: ChatMessage }
> {
    const { user } = await requireSession();

    // Checked here: actions can be called with anything
    const recipientId = parseActionInput(idSchema, recipientIdInput);
    if (recipientId === user.id) {
        throw new Error("Invalid recipient");
    }
    const content = formText(messageContentSchema).safeParse(
        formData.get("content"),
    );
    if (!content.success) {
        return {
            error: content.error.issues[0]?.message ?? "Write something first",
        };
    }

    // The conversation's time is the message's, so the list sorts by it
    const now = new Date();
    const pair = conversationPair(user.id, recipientId);
    // Fails on the foreign key if the recipient doesn't exist
    return prisma.$transaction(async (tx) => {
        const conversation = await tx.conversation.upsert({
            where: { user1Id_user2Id: pair },
            create: { ...pair, lastMessageAt: now },
            update: { lastMessageAt: now },
            select: { id: true },
        });
        const message = await tx.message.create({
            data: {
                conversationId: conversation.id,
                senderId: user.id,
                recipientId,
                content: content.data,
                createdAt: now,
            },
            select: { id: true, content: true, createdAt: true },
        });
        return { error: null, message: { ...message, isOwn: true } };
    });
}
