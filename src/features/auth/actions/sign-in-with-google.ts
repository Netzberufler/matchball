"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, isGoogleSignInEnabled } from "@/features/auth/lib/auth";
import type { AuthFormError } from "@/features/auth/utils/auth-errors";
import { getSafeRedirect } from "@/features/auth/utils/redirect";

// Sends the user to Google. Google redirects back to
// /api/auth/callback/google, which signs the user in (or creates the account)
// and then continues to redirectTo, or to /sign-in?error=... on failure.
export async function signInWithGoogle(
    redirectTo: string | null,
): Promise<{ error: AuthFormError }> {
    if (!isGoogleSignInEnabled) {
        return { error: { message: "Google sign-in isn't set up yet" } };
    }

    const { url } = await auth.api.signInSocial({
        body: {
            provider: "google",
            callbackURL: getSafeRedirect(redirectTo),
            errorCallbackURL: "/sign-in",
        },
        headers: await headers(),
    });

    if (!url) {
        return {
            error: { message: "Google sign-in failed. Please try again." },
        };
    }
    redirect(url);
}
