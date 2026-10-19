import { Suspense } from "react";
import { MobileNavLinks, MobileNavLinksFallback } from "./mobile-nav";

// Fixed bottom navigation, only shown below the md breakpoint
export default function MobileNavBar() {
    return (
        <nav
            aria-label="Main"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-default bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
        >
            <Suspense fallback={<MobileNavLinksFallback />}>
                <MobileNavLinks />
            </Suspense>
        </nav>
    );
}
