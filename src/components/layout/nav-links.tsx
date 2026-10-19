"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath, navItems } from "./nav-items";

const linkClassName =
    "flex items-center justify-center gap-3 rounded-2xl py-3 text-lg font-medium text-foreground transition-colors lg:justify-start lg:px-4 lg:py-2";

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
                            <span className="sr-only lg:not-sr-only">
                                {label}
                            </span>
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
