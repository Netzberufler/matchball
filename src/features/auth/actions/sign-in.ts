"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAPIError } from "better-auth/api";
import { auth } from "@/features/auth/lib/auth";
import type { AuthFormError } from "@/features/auth/utils/auth-errors";
import {
    getSafeRedirect,
    REDIRECT_PARAM,
} from "@/features/auth/utils/redirect";

// Signs in with an email address or a username
export async function signIn(
    formData: FormData,
): Promise<{ error: AuthFormError }> {
    const login = String(formData.get("login") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
        const requestHeaders = await headers();
        // Email addresses contain an @, usernames can't
        if (login.includes("@")) {
            await auth.api.signInEmail({
                body: { email: login, password },
                headers: requestHeaders,
            });
        } else {
            await auth.api.signInUsername({
                body: { username: login, password },
                headers: requestHeaders,
            });
        }
    } catch (error) {
        if (isAPIError(error)) {
            // Same message for every credential error, so the form doesn't
            // reveal whether an account exists
            return { error: { message: "Wrong email, username or password" } };
        }
        throw error;
    }

    // Signed in: the nextCookies plugin has set the session cookie. Go back to
    // the page the proxy sent the user away from, if any.
    redirect(getSafeRedirect(formData.get(REDIRECT_PARAM)));
}
