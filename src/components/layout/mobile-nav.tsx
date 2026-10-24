"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavItems, isActivePath } from "./nav-items";

const linkClassName =
    "flex flex-col items-center gap-1 rounded-full py-2 text-xs text-foreground font-medium tracking-tight transition-colors";

function MobileNavList({
    pathname,
    username,
}: {
    pathname: string | null;
    username: string | null;
}) {
    return (
        <ul className="grid h-full grid-cols-5 items-center">
            {getNavItems(username)
                .filter((item) => !item.desktopOnly)
                .map(({ href, label, shortLabel, icon: Icon }) => {
                    const isActive = isActivePath(href, pathname);
                    const content = (
                        <>
                            <Icon className="size-5 shrink-0" aria-hidden />
                            <span className="max-w-full truncate">
                                {shortLabel}
                            </span>
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
                })}
        </ul>
    );
}

// username is the signed-in user's, for the Profile link
export function MobileNavLinks({ username }: { username: string }) {
    return <MobileNavList pathname={usePathname()} username={username} />;
}

// Rendered while the pathname and session are unknown during prerendering,
// without active state or Profile link
export function MobileNavLinksFallback() {
    return <MobileNavList pathname={null} username={null} />;
}
