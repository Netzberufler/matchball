"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath, navItems } from "./nav-items";

const linkClassName =
    "flex items-center gap-3 rounded-2xl px-4 py-2 text-lg font-medium text-foreground transition-colors";

function NavLinkList({ pathname }: { pathname: string | null }) {
    return (
        <ul className="flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = isActivePath(href, pathname);
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

export function NavLinks() {
    return <NavLinkList pathname={usePathname()} />;
}

// Rendered while the pathname is unknown during prerendering, without active state
export function NavLinksFallback() {
    return <NavLinkList pathname={null} />;
}
