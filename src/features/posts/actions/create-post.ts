"use server";

import { refresh } from "next/cache";
import { requireSession } from "@/features/auth/lib/session";
import { findMentionedUsers } from "@/features/mentions/lib/queries";
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
    await prisma.post.create({
        data: {
            content,
            authorId: user.id,
            mentions: { createMany: { data: mentions } },
        },
    });

    // Reload the feeds on the current page so the new post shows up
    refresh();
    return { error: null };
}
