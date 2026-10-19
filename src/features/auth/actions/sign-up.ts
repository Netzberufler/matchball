"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAPIError } from "better-auth/api";
import { auth } from "@/features/auth/lib/auth";
import {
    type AuthFormError,
    toAuthFormError,
} from "@/features/auth/utils/auth-errors";

// Better Auth validates the input again (see the hooks in lib/auth.ts)
export async function signUp(
    formData: FormData,
): Promise<{ error: AuthFormError }> {
    try {
        await auth.api.signUpEmail({
            body: {
                email: String(formData.get("email") ?? ""),
                username: String(formData.get("username") ?? ""),
                name: String(formData.get("name") ?? ""),
                password: String(formData.get("password") ?? ""),
            },
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

    // Signed in: the nextCookies plugin has set the session cookie
    redirect("/");
}
