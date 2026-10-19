import { CalendarCheck, House, Swords, Trophy, UserRound } from "lucide-react";

// Shared by the desktop sidebar and the mobile nav bar.
// shortLabel is used where space is tight (mobile nav bar).
export const navItems = [
    { href: "/", label: "Home", shortLabel: "Home", icon: House },
    { href: "/matches", label: "Matches", shortLabel: "Matches", icon: Swords },
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
        href: "/profile",
        label: "Profile",
        shortLabel: "Profile",
        icon: UserRound,
    },
] as const;

// pathname is null while it is unknown during prerendering
export function isActivePath(href: string, pathname: string | null) {
    if (pathname === null) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
}
