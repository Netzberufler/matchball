"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath, navItems } from "./nav-items";

const linkClassName =
    "flex flex-col items-center gap-1 rounded-full px-1 py-2 text-xs font-medium tracking-tight text-foreground transition-colors lg:flex-row lg:gap-3 lg:px-4 lg:text-lg lg:tracking-normal";

function NavLinkList({ pathname }: { pathname: string | null }) {
    return (
        <ul className="flex flex-col gap-1">
            {navItems.map(({ href, label, shortLabel, icon: Icon }) => {
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
                            <span className="max-w-full truncate lg:hidden">
                                {shortLabel}
                            </span>
                            <span className="hidden lg:inline">{label}</span>
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
