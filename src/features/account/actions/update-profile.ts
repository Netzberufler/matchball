"use server";

import { headers } from "next/headers";
import { refresh } from "next/cache";
import { isAPIError } from "better-auth/api";
import { auth } from "@/features/auth/lib/auth";
import { requireSession } from "@/features/auth/lib/session";
import {
    type AuthFormError,
    toAuthFormError,
} from "@/features/auth/utils/auth-errors";

// Better Auth validates the name again (see the hooks in lib/auth.ts)
export async function updateProfile(
    formData: FormData,
): Promise<{ error: AuthFormError | null }> {
    await requireSession();

    try {
        await auth.api.updateUser({
            body: { name: String(formData.get("name") ?? "") },
            headers: await headers(),
        });
    } catch (error) {
        if (isAPIError(error)) {
            return {
                error: toAuthFormError({
                    code: error.body?.code,
                    message: error.body?.message,
                }),
            };
        }
        throw error;
    }

    // Reload the page's server data, e.g. the name in the sidebar
    refresh();
    return { error: null };
}
