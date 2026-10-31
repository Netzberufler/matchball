import { Suspense } from "react";
import { requireSession } from "@/features/auth/lib/session";
import { countNewNotifications } from "@/features/notifications/lib/queries";
import {
    UserMenu,
    UserMenuFallback,
} from "@/features/auth/components/user-menu";
import { Logo } from "./logo";
import { NavLinks, NavLinksFallback } from "./nav-links";

export default function Sidebar() {
    return (
        <aside className="hidden md:flex md:flex-col sticky top-0 h-dvh py-4 px-2 sm:py-8 sm:px-4 md:px-2 lg:px-4 overflow-y-auto border-r border-default">
            <SidebarContent />
        </aside>
    );
}

// Logo, navigation and user menu; shared with the mobile menu drawer.
// expanded: always the full layout; otherwise compact below lg, for the
// narrow tablet sidebar.
export function SidebarContent({ expanded = false }: { expanded?: boolean }) {
    return (
        <>
            <div className="mb-8">
                <Logo compact={!expanded} />
            </div>
            <nav aria-label="Main">
                {/* Reads the session at request time, for the Profile link */}
                <Suspense fallback={<NavLinksFallback expanded={expanded} />}>
                    <SessionNavLinks expanded={expanded} />
                </Suspense>
            </nav>
            <div className="mt-auto pt-4">
                {/* Reads the session at request time */}
                <Suspense fallback={<UserMenuFallback expanded={expanded} />}>
                    <UserMenu expanded={expanded} />
                </Suspense>
            </div>
        </>
    );
}

// Seeing notifications on /notifications refreshes the page, which updates
// their count here (see markNotificationsSeen)
async function SessionNavLinks({ expanded }: { expanded: boolean }) {
    const { user } = await requireSession();
    const newNotifications = await countNewNotifications(user.id);
    return (
        <NavLinks
            // username is required in the database; Better Auth types it as
            // optional
            username={user.username ?? ""}
            newNotifications={newNotifications}
            expanded={expanded}
        />
    );
}
