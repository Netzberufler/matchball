import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/features/auth/lib/auth";

// Only GET, for the redirect back from Google (/api/auth/callback/google).
// Sign-in and sign-up use POST and stay server-action only.
export const { GET } = toNextJsHandler(auth);
