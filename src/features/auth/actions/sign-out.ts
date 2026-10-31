"use server";

import { headers } from "next/headers";
import { isAPIError } from "better-auth/api";
import { auth } from "@/features/auth/lib/auth";
import { deleteSessionCookies } from "@/features/auth/lib/session";

// Signs out; the caller then loads /sign-in, see UserMenuDropdown
export async function signOut() {
    try {
        // Deletes the session; the nextCookies plugin removes the cookie
        await auth.api.signOut({ headers: await headers() });
    } catch (error) {
        if (!isAPIError(error)) {
            throw error;
        }
        // The session was already gone: still remove the cookie
        await deleteSessionCookies();
    }
}
