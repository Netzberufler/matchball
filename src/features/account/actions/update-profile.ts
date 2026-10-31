"use server";

import { requireSession } from "@/features/auth/lib/session";
import {
    PROFILE_FIELDS,
    profileFormSchema,
} from "@/features/account/utils/profile-rules";
import { firstError, formFields } from "@/lib/form-validation";
import { revalidateAllPages } from "@/lib/revalidate";
import { prisma } from "@/prisma/db";

export type ProfileFormError = {
    field?: "name" | "bio" | "gender";
    message: string;
};

// Saves the signed-in user's name, bio and gender together, so either all
// or none change
export async function updateProfile(
    formData: FormData,
): Promise<{ error: ProfileFormError | null }> {
    const { user } = await requireSession();

    // Checked again here with the form's schema: actions can be called
    // without the form
    const parsed = profileFormSchema.safeParse(
        formFields(formData, PROFILE_FIELDS),
    );
    if (!parsed.success) {
        const { field, message } = firstError(parsed.error);
        return {
            error: { field: field as ProfileFormError["field"], message },
        };
    }
    const { name, bio, gender } = parsed.data;

    await prisma.user.update({
        where: { id: user.id },
        data: { name, bio, gender },
    });

    // The name shows on most pages: the sidebar, posts, matches
    revalidateAllPages();
    return { error: null };
}
