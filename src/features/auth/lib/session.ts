import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth/lib/auth";

// The secure session check. src/proxy.ts only checks that a session cookie
// exists, so call this wherever user data is read or changed. It validates
// the session against the database and sends invalid sessions to /sign-in.
// cache() runs the lookup once per request, however often it's called.
export const requireSession = cache(async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        redirect("/sign-in");
    }
    return session;
});
