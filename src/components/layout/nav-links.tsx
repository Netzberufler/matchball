"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { href: "/", label: "Home" },
    { href: "/matches", label: "Matches" },
    { href: "/tournaments", label: "Tournaments" },
    { href: "/courts", label: "Court Booking" },
    { href: "/profile", label: "Profile" },
] as const;

const linkClassName =
    "block rounded-2xl px-4 py-2 text-md font-medium text-foreground transition-colors";

export function NavLinks() {
    const pathname = usePathname();

    return (
        <ul className="flex flex-col gap-1">
            {links.map(({ href, label }) => {
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
            {links.map(({ href, label }) => (
                <li key={href}>
                    <Link
                        href={href}
                        className={`${linkClassName} text-foreground hover:bg-default`}
                    >
                        {label}
                    </Link>
                </li>
            ))}
        </ul>
    );
}
