import { redirect } from "next/navigation";
import { deleteSessionCookies } from "@/features/auth/lib/session";

// requireSession() sends users with an invalid or revoked session here: the
// stale cookie is removed, so the proxy lets them reach /sign-in again
export async function GET() {
    await deleteSessionCookies();
    redirect("/sign-in");
}
