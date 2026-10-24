import {
    Bell,
    CalendarCheck,
    House,
    Swords,
    Trophy,
    UserRound,
} from "lucide-react";
import { profilePath } from "@/features/profile/utils/profile-path";

// Shared by the desktop sidebar and the mobile nav bar.
// shortLabel is used where space is tight (mobile nav bar).
// desktopOnly items are left out of the mobile nav bar.
// username is the signed-in user's, for the Profile link; null while it's
// unknown during prerendering, which leaves that link without an href.
export function getNavItems(username: string | null) {
    return [
        { href: "/", label: "Home", shortLabel: "Home", icon: House },
        {
            href: "/notifications",
            label: "Notifications",
            shortLabel: "Notifications",
            icon: Bell,
            desktopOnly: true,
        },
        {
            href: "/matches",
            label: "Matches",
            shortLabel: "Matches",
            icon: Swords,
        },
        {
            href: "/tournaments",
            label: "Tournaments",
            shortLabel: "Tournaments",
            icon: Trophy,
        },
        {
            href: "/courts",
            label: "Court Booking",
            shortLabel: "Courts",
            icon: CalendarCheck,
        },
        {
            href: username === null ? null : profilePath(username),
            label: "Profile",
            shortLabel: "Profile",
            icon: UserRound,
        },
    ];
}

// pathname is null while it is unknown during prerendering
export function isActivePath(href: string | null, pathname: string | null) {
    if (href === null || pathname === null) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
}
