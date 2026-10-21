import { Suspense } from "react";
import { requireSession } from "@/features/auth/lib/session";
import { MobileNavLinks, MobileNavLinksFallback } from "./mobile-nav";

// Floating bottom navigation, only shown below the md breakpoint.
// Stays above the iOS home indicator.
export default function MobileNavBar() {
    return (
        <nav
            aria-label="Main"
            className="fixed inset-x-4 sm:inset-x-6 bottom-(--mobile-nav-offset) h-(--mobile-nav-height) z-50 rounded-full border border-default bg-surface px-1 md:hidden"
        >
            {/* Reads the session at request time, for the Profile link */}
            <Suspense fallback={<MobileNavLinksFallback />}>
                <SessionMobileNavLinks />
            </Suspense>
        </nav>
    );
}

async function SessionMobileNavLinks() {
    const { user } = await requireSession();
    // username is required in the database; Better Auth types it as optional
    return <MobileNavLinks username={user.username ?? ""} />;
}
