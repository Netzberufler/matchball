import {
    Bell,
    CalendarCheck,
    House,
    Medal,
    MessagesSquare,
    Search,
    Sword,
    Swords,
    Trophy,
    UserRound,
} from "lucide-react";
import { profilePath } from "@/features/profile/utils/profile-path";

// Shared by the desktop sidebar and the mobile nav bar. The sidebar shows
// the sections under their labels; the first section has none.
// shortLabel is used where space is tight (mobile nav bar).
// desktopOnly items are left out of the mobile nav bar.
// username is the signed-in user's, for the Profile link; null while it's
// unknown during prerendering, which leaves that link without an href.
export function getNavSections(username: string | null) {
    return [
        {
            label: null,
            items: [
                { href: "/", label: "Home", shortLabel: "Home", icon: House },
                {
                    href: "/explore",
                    label: "Explore",
                    shortLabel: "Explore",
                    icon: Search,
                    desktopOnly: true,
                },
                {
                    href: "/messages",
                    label: "Messages",
                    shortLabel: "Messages",
                    icon: MessagesSquare,
                    desktopOnly: true,
                },
            ],
        },
        {
            label: "Tennis",
            items: [
                {
                    href: "/challenges",
                    label: "Challenges",
                    shortLabel: "Challenges",
                    icon: Sword,
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
            ],
        },
        {
            label: "You",
            items: [
                {
                    href: "/achievements",
                    label: "Achievements",
                    shortLabel: "Achievements",
                    icon: Medal,
                    desktopOnly: true,
                },
                {
                    href: "/notifications",
                    label: "Notifications",
                    shortLabel: "Notifications",
                    icon: Bell,
                    desktopOnly: true,
                },
                {
                    href: username === null ? null : profilePath(username),
                    label: "Profile",
                    shortLabel: "Profile",
                    icon: UserRound,
                },
            ],
        },
    ];
}

export function getNavItems(username: string | null) {
    return getNavSections(username).flatMap((section) => section.items);
}

// pathname is null while it is unknown during prerendering
export function isActivePath(href: string | null, pathname: string | null) {
    if (href === null || pathname === null) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
}
