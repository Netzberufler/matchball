"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Whether the user moved between pages of the app in this tab, so the
// browser's previous page is one of ours. Lives as long as the page does.
let hasNavigatedInApp = false;

// Records in-app navigations. Render once in the app layout, inside
// <Suspense> (it reads the pathname).
export function NavigationTracker() {
    const pathname = usePathname();
    const firstPathname = useRef(pathname);

    useEffect(() => {
        if (pathname !== firstPathname.current) {
            hasNavigatedInApp = true;
        }
    }, [pathname]);

    return null;
}

// True if going back stays in the app: after in-app navigation, or after a
// full page load from one of our pages. False when the page was opened
// directly, in a new tab or from another site.
export function canGoBackInApp() {
    if (hasNavigatedInApp) {
        return true;
    }
    try {
        return (
            window.history.length > 1 &&
            new URL(document.referrer).origin === window.location.origin
        );
    } catch {
        // No referrer
        return false;
    }
}
