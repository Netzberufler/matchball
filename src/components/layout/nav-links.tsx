"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavItems, isActivePath } from "./nav-items";

// Compact below lg, for the narrow tablet sidebar
const compactLinkClassName =
    "flex flex-col items-center gap-1 rounded-full px-1 py-2 text-xs font-medium tracking-tight text-foreground transition-colors lg:flex-row lg:gap-3 lg:px-4 lg:text-lg lg:tracking-normal";
const expandedLinkClassName =
    "flex items-center gap-3 rounded-full px-4 py-2 text-lg font-medium text-foreground transition-colors";

function NavLinkList({
    pathname,
    username,
    expanded,
}: {
    pathname: string | null;
    username: string | null;
    expanded: boolean;
}) {
    const linkClassName = expanded
        ? expandedLinkClassName
        : compactLinkClassName;
    return (
        <ul className="flex flex-col gap-1">
            {getNavItems(username).map(
                ({ href, label, shortLabel, icon: Icon }) => {
                    const isActive = isActivePath(href, pathname);
                    const content = (
                        <>
                            <Icon className="size-5 shrink-0" aria-hidden />
                            {expanded ? (
                                <span>{label}</span>
                            ) : (
                                <>
                                    <span className="max-w-full truncate lg:hidden">
                                        {shortLabel}
                                    </span>
                                    <span className="hidden lg:inline">
                                        {label}
                                    </span>
                                </>
                            )}
                        </>
                    );
                    return (
                        <li key={label}>
                            {href === null ? (
                                // Not a link until the href is known
                                <span className={linkClassName}>{content}</span>
                            ) : (
                                <Link
                                    href={href}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`${linkClassName} ${
                                        isActive
                                            ? "bg-default"
                                            : "hover:bg-default"
                                    }`}
                                >
                                    {content}
                                </Link>
                            )}
                        </li>
                    );
                },
            )}
        </ul>
    );
}

// username is the signed-in user's, for the Profile link.
// expanded: always show the full labels, e.g. in the mobile menu drawer.
export function NavLinks({
    username,
    expanded = false,
}: {
    username: string;
    expanded?: boolean;
}) {
    return (
        <NavLinkList
            pathname={usePathname()}
            username={username}
            expanded={expanded}
        />
    );
}

// Rendered while the pathname and session are unknown during prerendering,
// without active state or Profile link
export function NavLinksFallback({ expanded = false }: { expanded?: boolean }) {
    return <NavLinkList pathname={null} username={null} expanded={expanded} />;
}
