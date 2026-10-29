import * as z from "zod/mini";

// Pages that signed-out users can visit; everything else needs a session
export const AUTH_PAGES = ["/sign-in", "/sign-up"];

export const REDIRECT_PARAM = "redirectTo";

// A path within this app, so redirectTo can't send users to another site
// after signing in ("//evil.com" or "/\\evil.com" would leave the app), and
// not back to the sign-in pages. No control characters: browsers drop tabs
// and line breaks from URLs, so "/\t/evil.com" would become "//evil.com".
const redirectPathSchema = z.string().check(
    z.maxLength(2048),
    z.startsWith("/"),
    z.refine(
        (value) =>
            !/[\x00-\x1f\x7f]/.test(value) &&
            !value.startsWith("//") &&
            !value.startsWith("/\\") &&
            !AUTH_PAGES.some((page) => value.startsWith(page)),
    ),
);

// Where to go after signing in: `value` if it's a safe path, otherwise "/"
export function getSafeRedirect(value: unknown) {
    const result = redirectPathSchema.safeParse(value);
    return result.success ? result.data : "/";
}
