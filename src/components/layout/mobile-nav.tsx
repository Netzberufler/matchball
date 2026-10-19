"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath, navItems } from "./nav-items";

function MobileNavList({ pathname }: { pathname: string | null }) {
    return (
        <ul className="grid grid-cols-5">
            {navItems.map(({ href, shortLabel, icon: Icon }) => {
                const isActive = isActivePath(href, pathname);
                return (
                    <li key={href}>
                        <Link
                            href={href}
                            aria-current={isActive ? "page" : undefined}
                            className={`flex flex-col items-center gap-1 py-2 text-xs font-medium tracking-tight transition-colors ${
                                isActive
                                    ? "text-accent"
                                    : "text-muted hover:text-foreground"
                            }`}
                        >
                            <Icon className="size-6 shrink-0" aria-hidden />
                            <span className="max-w-full truncate">
                                {shortLabel}
                            </span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

export function MobileNavLinks() {
    return <MobileNavList pathname={usePathname()} />;
}

// Rendered while the pathname is unknown during prerendering, without active state
export function MobileNavLinksFallback() {
    return <MobileNavList pathname={null} />;
}
