"use server";

import { refresh } from "next/cache";
import { requireSession } from "@/features/auth/lib/session";
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

    await prisma.post.create({
        data: { content, authorId: user.id },
    });

    // Reload the feeds on the current page so the new post shows up
    refresh();
    return { error: null };
}
