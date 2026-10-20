import { Suspense } from "react";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { Logo } from "./logo";
import { NavLinks, NavLinksFallback } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

export default function Sidebar() {
    return (
        <aside className="hidden md:flex md:flex-col sticky top-0 h-dvh py-4 px-2 sm:py-8 sm:px-4 md:px-2 lg:px-4 overflow-y-auto border-r border-default">
            <div className="mb-8">
                <Logo compact />
            </div>
            <nav aria-label="Main">
                <Suspense fallback={<NavLinksFallback />}>
                    <NavLinks />
                </Suspense>
            </nav>
            <div className="mt-auto pt-4">
                <ThemeToggle />
                <SignOutButton />
            </div>
        </aside>
    );
}
