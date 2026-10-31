"use server";

import { requireSession } from "@/features/auth/lib/session";
import { findMentionedUsers } from "@/features/mentions/lib/queries";
import { mentionNotifications } from "@/features/notifications/lib/notify";
import { postContentSchema } from "@/features/posts/utils/post-rules";
import { formText } from "@/lib/form-validation";
import { revalidateAllPages } from "@/lib/revalidate";
import { prisma } from "@/prisma/db";

export async function createPost(
    formData: FormData,
): Promise<{ error: string | null }> {
    const { user } = await requireSession();

    // Checked here: actions can be called without the form
    const parsed = formText(postContentSchema).safeParse(
        formData.get("content"),
    );
    if (!parsed.success) {
        return {
            error: parsed.error.issues[0]?.message ?? "Write something first",
        };
    }
    const content = parsed.data;

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

    // The new post shows in the feeds and on the viewer's profile
    revalidateAllPages();
    return { error: null };
}
