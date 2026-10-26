"use server";

import { refresh } from "next/cache";
import { requireSession } from "@/features/auth/lib/session";
import { validateName } from "@/features/auth/utils/auth-rules";
import {
    normalizeBio,
    parseGender,
    validateBio,
} from "@/features/account/utils/profile-rules";
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

    // Validated again here: actions can be called without the form
    const name = String(formData.get("name") ?? "").trim();
    const nameError = validateName(name);
    if (nameError) {
        return { error: { field: "name", message: nameError } };
    }
    const bioInput = String(formData.get("bio") ?? "");
    const bioError = validateBio(bioInput);
    if (bioError) {
        return { error: { field: "bio", message: bioError } };
    }
    // Optional; only the Gender enum's values, anything else is refused
    const gender = parseGender(formData.get("gender"));
    if (gender === undefined) {
        return { error: { field: "gender", message: "Choose a gender" } };
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { name, bio: normalizeBio(bioInput), gender },
    });

    // Reload the page's server data, e.g. the name in the sidebar
    refresh();
    return { error: null };
}
