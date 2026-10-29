"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAPIError } from "better-auth/api";
import { auth } from "@/features/auth/lib/auth";
import {
    type AuthFormError,
    toAuthFormError,
} from "@/features/auth/utils/auth-errors";
import {
    SIGN_UP_FIELDS,
    signUpFormSchema,
} from "@/features/auth/utils/auth-rules";
import { firstError, formFields } from "@/lib/form-validation";

// Checks the form's fields with the schema the form uses, then creates the
// account. Better Auth validates the input again (see the hooks in
// lib/auth.ts).
export async function signUp(
    formData: FormData,
): Promise<{ error: AuthFormError }> {
    const parsed = signUpFormSchema.safeParse(
        formFields(formData, SIGN_UP_FIELDS),
    );
    if (!parsed.success) {
        const { field, message } = firstError(parsed.error);
        return {
            error: { field: field as AuthFormError["field"], message },
        };
    }

    try {
        await auth.api.signUpEmail({
            body: parsed.data,
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
