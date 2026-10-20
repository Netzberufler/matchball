import "server-only";

import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth/lib/auth";

// The secure session check. src/proxy.ts only checks that a session cookie
// exists, so call this wherever user data is read or changed. It validates
// the session against the database. Invalid sessions go to /session-expired,
// which removes the stale cookie: going straight to /sign-in would loop,
// because the proxy sends anyone with a session cookie back to /.
// cache() runs the lookup once per request, however often it's called.
export const requireSession = cache(async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        redirect("/session-expired");
    }
    return session;
});

// Only works where cookies can be changed: server actions and route handlers
export async function deleteSessionCookies() {
    const cookieStore = await cookies();
    for (const cookie of cookieStore.getAll()) {
        if (cookie.name.includes("better-auth.session")) {
            cookieStore.delete(cookie.name);
        }
    }
}
