"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAPIError } from "better-auth/api";
import { auth } from "@/features/auth/lib/auth";
import { deleteSessionCookies } from "@/features/auth/lib/session";

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

    redirect("/sign-in");
}
