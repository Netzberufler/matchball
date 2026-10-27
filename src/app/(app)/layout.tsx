import { Suspense } from "react";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import MobileNavBar from "@/components/layout/mobile-nav-bar";
import { NavigationTracker } from "@/components/layout/navigation-history";

// Layout for signed-in users; src/proxy.ts sends everyone else to /sign-in
export default function AppLayout({ children }: LayoutProps<"/">) {
    return (
        <>
            <MobileHeader />
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-0 max-sm:py-4 max-md:py-6 grid grid-cols-1 md:grid-cols-[96px_1fr] lg:grid-cols-[320px_1fr]">
                <Sidebar />
                <main className="min-h-dvh max-md:pb-[calc(var(--mobile-nav-height)+var(--mobile-nav-offset))] md:px-8 md:py-8">
                    {children}
                </main>
            </div>
            <MobileNavBar />
            {/* Lets back buttons know if the previous page is ours */}
            <Suspense fallback={null}>
                <NavigationTracker />
            </Suspense>
        </>
    );
}
