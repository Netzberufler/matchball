"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavItems, isActivePath } from "./nav-items";

const linkClassName =
    "flex flex-col items-center gap-1 rounded-full px-1 py-2 text-xs font-medium tracking-tight text-foreground transition-colors lg:flex-row lg:gap-3 lg:px-4 lg:text-lg lg:tracking-normal";

function NavLinkList({
    pathname,
    username,
}: {
    pathname: string | null;
    username: string | null;
}) {
    return (
        <ul className="flex flex-col gap-1">
            {getNavItems(username).map(
                ({ href, label, shortLabel, icon: Icon }) => {
                    const isActive = isActivePath(href, pathname);
                    const content = (
                        <>
                            <Icon className="size-5 shrink-0" aria-hidden />
                            <span className="max-w-full truncate lg:hidden">
                                {shortLabel}
                            </span>
                            <span className="hidden lg:inline">{label}</span>
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

// username is the signed-in user's, for the Profile link
export function NavLinks({ username }: { username: string }) {
    return <NavLinkList pathname={usePathname()} username={username} />;
}

// Rendered while the pathname and session are unknown during prerendering,
// without active state or Profile link
export function NavLinksFallback() {
    return <NavLinkList pathname={null} username={null} />;
}
