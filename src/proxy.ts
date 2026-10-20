import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { AUTH_PAGES, REDIRECT_PARAM } from "@/features/auth/utils/redirect";

// Optimistic auth check: only looks for the session cookie, without a
// database lookup, because the proxy runs on every request (including
// prefetches). Pages and actions that use user data must still verify the
// session with requireSession() from features/auth/lib/session.ts.
export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const isAuthPage = AUTH_PAGES.includes(pathname);
    const hasSessionCookie = Boolean(getSessionCookie(request));

    // Signed-out users can only see the sign-in and sign-up pages
    if (!hasSessionCookie && !isAuthPage) {
        const signInUrl = new URL("/sign-in", request.url);
        if (pathname !== "/") {
            signInUrl.searchParams.set(REDIRECT_PARAM, pathname + search);
        }
        return NextResponse.redirect(signInUrl);
    }

    // Signed-in users don't need the sign-in and sign-up pages
    if (hasSessionCookie && isAuthPage) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Every page, but not Next.js internals or static files like favicon.ico
    matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
