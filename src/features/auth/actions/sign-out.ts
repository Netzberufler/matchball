"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAPIError } from "better-auth/api";
import { auth } from "@/features/auth/lib/auth";

export async function signOut() {
    try {
        // Deletes the session; the nextCookies plugin removes the cookie
        await auth.api.signOut({ headers: await headers() });
    } catch (error) {
        if (!isAPIError(error)) {
            throw error;
        }
        // The session was already gone: still remove the cookie
        const cookieStore = await cookies();
        for (const cookie of cookieStore.getAll()) {
            if (cookie.name.includes("better-auth.session")) {
                cookieStore.delete(cookie.name);
            }
        }
    }

    redirect("/sign-in");
}
