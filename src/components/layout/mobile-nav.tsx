"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath, navItems } from "./nav-items";

function MobileNavList({ pathname }: { pathname: string | null }) {
    return (
        <ul className="grid grid-cols-5 py-1">
            {navItems.map(({ href, shortLabel, icon: Icon }) => {
                const isActive = isActivePath(href, pathname);
                return (
                    <li key={href}>
                        <Link
                            href={href}
                            aria-current={isActive ? "page" : undefined}
                            className={`flex flex-col items-center gap-1 rounded-full py-2 text-xs text-foreground font-medium tracking-tight transition-colors ${
                                isActive ? "bg-default" : "hover:bg-default"
                            }`}
                        >
                            <Icon className="size-5 shrink-0" aria-hidden />
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
