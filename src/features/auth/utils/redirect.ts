// Pages that signed-out users can visit; everything else needs a session
export const AUTH_PAGES = ["/sign-in", "/sign-up"];

export const REDIRECT_PARAM = "redirectTo";

// Only allow paths within this app, so redirectTo can't send users to
// another site after signing in ("//evil.com" would leave the app)
export function getSafeRedirect(value: unknown) {
    if (
        typeof value !== "string" ||
        !value.startsWith("/") ||
        value.startsWith("//") ||
        value.startsWith("/\\") ||
        AUTH_PAGES.some((page) => value.startsWith(page))
    ) {
        return "/";
    }
    return value;
}
