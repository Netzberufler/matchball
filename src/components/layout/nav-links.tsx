"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, House, Swords, Trophy, UserRound } from "lucide-react";

const links = [
    { href: "/", label: "Home", icon: House },
    { href: "/matches", label: "Matches", icon: Swords },
    { href: "/tournaments", label: "Tournaments", icon: Trophy },
    { href: "/courts", label: "Court Booking", icon: CalendarCheck },
    { href: "/profile", label: "Profile", icon: UserRound },
] as const;

const linkClassName =
    "flex items-center gap-3 rounded-2xl px-4 py-2 text-md font-medium text-foreground transition-colors";

export function NavLinks() {
    const pathname = usePathname();

    return (
        <ul className="flex flex-col gap-1">
            {links.map(({ href, label, icon: Icon }) => {
                const isActive =
                    href === "/"
                        ? pathname === "/"
                        : pathname === href || pathname.startsWith(`${href}/`);
                return (
                    <li key={href}>
                        <Link
                            href={href}
                            aria-current={isActive ? "page" : undefined}
                            className={`${linkClassName} ${
                                isActive ? "bg-default" : "hover:bg-default"
                            }`}
                        >
                            <Icon className="size-5 shrink-0" aria-hidden />
                            {label}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

// Rendered while the pathname is unknown during prerendering, without active state
export function NavLinksFallback() {
    return (
        <ul className="flex flex-col gap-1">
            {links.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                    <Link
                        href={href}
                        className={`${linkClassName} text-foreground hover:bg-default`}
                    >
                        <Icon className="size-5 shrink-0" aria-hidden />
                        {label}
                    </Link>
                </li>
            ))}
        </ul>
    );
}
