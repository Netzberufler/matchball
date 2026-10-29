"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAPIError } from "better-auth/api";
import { auth } from "@/features/auth/lib/auth";
import type { AuthFormError } from "@/features/auth/utils/auth-errors";
import {
    SIGN_IN_FIELDS,
    signInFormSchema,
} from "@/features/auth/utils/auth-rules";
import {
    getSafeRedirect,
    REDIRECT_PARAM,
} from "@/features/auth/utils/redirect";
import { firstError, formFields } from "@/lib/form-validation";

// Signs in with an email address or a username
export async function signIn(
    formData: FormData,
): Promise<{ error: AuthFormError }> {
    // Checked with the form's schema first, which also keeps overlong
    // passwords away from password hashing
    const parsed = signInFormSchema.safeParse(
        formFields(formData, SIGN_IN_FIELDS),
    );
    if (!parsed.success) {
        return { error: { message: firstError(parsed.error).message } };
    }
    const { login, password } = parsed.data;

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
            return { error: { message: "Wrong email, username or password" } };
        }
        throw error;
    }

    // Signed in: the nextCookies plugin has set the session cookie. Go back to
    // the page the proxy sent the user away from, if any.
    redirect(getSafeRedirect(formData.get(REDIRECT_PARAM)));
}
