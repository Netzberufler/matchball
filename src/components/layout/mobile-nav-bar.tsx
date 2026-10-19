import { Suspense } from "react";
import { MobileNavLinks, MobileNavLinksFallback } from "./mobile-nav";

// Floating bottom navigation, only shown below the md breakpoint.
// Stays above the iOS home indicator.
export default function MobileNavBar() {
    return (
        <nav
            aria-label="Main"
            className="fixed inset-x-4 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 rounded-full border border-default bg-surface px-1 md:hidden"
        >
            <Suspense fallback={<MobileNavLinksFallback />}>
                <MobileNavLinks />
            </Suspense>
        </nav>
    );
}
