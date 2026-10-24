"use server";

import { refresh } from "next/cache";
import { requireSession } from "@/features/auth/lib/session";
import { findMentionedUsers } from "@/features/mentions/lib/queries";
import { mentionNotifications } from "@/features/notifications/lib/notify";
import { validatePostContent } from "@/features/posts/utils/post-rules";
import { prisma } from "@/prisma/db";

export async function createPost(
    formData: FormData,
): Promise<{ error: string | null }> {
    const { user } = await requireSession();

    // Validated again here: actions can be called without the form
    const content = String(formData.get("content") ?? "").trim();
    const error = validatePostContent(content);
    if (error) {
        return { error };
    }

    // Only real users are saved as mentions, so only they become links
    const mentions = await findMentionedUsers(content);
    // The post, its mentions and their notifications in one statement
    // batch, so either all or none are saved
    await prisma.post.create({
        data: {
            content,
            authorId: user.id,
            mentions: { createMany: { data: mentions } },
            notifications: {
                createMany: {
                    data: mentionNotifications(mentions, user.id),
                },
            },
        },
    });

    // Reload the feeds on the current page so the new post shows up
    refresh();
    return { error: null };
}
