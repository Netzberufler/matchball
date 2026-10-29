"use server";

import { refresh } from "next/cache";
import { requireSession } from "@/features/auth/lib/session";
import {
    deleteAvatarFile,
    InvalidAvatarError,
    processAvatar,
    saveAvatar,
} from "@/features/account/lib/avatar-storage";
import { avatarUploadSchema } from "@/features/account/utils/avatar-rules";
import { prisma } from "@/prisma/db";

// Sets the signed-in user's profile photo from an uploaded image. The image
// is checked and re-encoded on the server (see lib/avatar-storage.ts); the
// browser's checks are only for quick feedback.
export async function uploadAvatar(
    formData: FormData,
): Promise<{ error: string | null }> {
    const { user } = await requireSession();

    // Checked here: actions can be called with anything
    const parsed = avatarUploadSchema.safeParse(formData.get("photo"));
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Choose an image" };
    }
    const file = parsed.data;

    let webp: Buffer;
    try {
        webp = await processAvatar(Buffer.from(await file.arrayBuffer()));
    } catch (error) {
        if (error instanceof InvalidAvatarError) {
            return { error: error.message };
        }
        throw error;
    }

    const imageUrl = await saveAvatar(webp);
    try {
        await prisma.user.update({
            where: { id: user.id },
            data: { image: imageUrl },
        });
    } catch (error) {
        // Don't keep a photo nobody uses
        await deleteAvatarFile(imageUrl);
        throw error;
    }
    // The previous photo, if it was an upload
    await deleteAvatarFile(user.image);

    // Reload the page's server data, e.g. the avatar in the sidebar
    refresh();
    return { error: null };
}

// Removes the signed-in user's profile photo, so their initials are shown
export async function removeAvatar(): Promise<void> {
    const { user } = await requireSession();

    await prisma.user.update({
        where: { id: user.id },
        data: { image: null },
    });
    await deleteAvatarFile(user.image);

    refresh();
}
