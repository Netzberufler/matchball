"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnreadMessageCount } from "@/features/messages/components/use-unread-message-count";
import { MESSAGES_PATH } from "@/features/messages/utils/messages-path";
import { getNavSections, isActivePath } from "./nav-items";

// Compact below lg, for the narrow tablet sidebar
const compactLinkClassName =
    "flex flex-col items-center gap-1 rounded-full px-1 py-2 text-xs font-medium tracking-tight text-foreground transition-colors lg:flex-row lg:gap-3 lg:px-4 lg:text-lg lg:tracking-normal";
const expandedLinkClassName =
    "flex items-center gap-3 rounded-full px-4 py-2 text-lg font-medium text-foreground transition-colors";
// Section labels; only visible from lg in the compact sidebar
const compactHeadingClassName =
    "sr-only lg:not-sr-only lg:block lg:mb-2 lg:px-4 lg:text-sm lg:font-medium lg:text-muted";
const expandedHeadingClassName = "mb-2 px-4 text-sm font-medium text-muted";
// The count of new notifications or unread messages
const countClassName =
    "h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold tabular-nums tracking-normal text-accent-foreground";

const NOTIFICATIONS_PATH = "/notifications";

// Up to two digits, to fit the badge
function formatCount(count: number) {
    return count > 99 ? "99+" : String(count);
}

function NavLinkList({
    pathname,
    username,
    newNotifications,
    unreadMessages,
    expanded,
}: {
    pathname: string | null;
    username: string | null;
    newNotifications: number;
    unreadMessages: number;
    expanded: boolean;
}) {
    // The new things each link has, shown as a count on it
    const newCounts: Record<string, number> = {
        [NOTIFICATIONS_PATH]: newNotifications,
        [MESSAGES_PATH]: unreadMessages,
    };
    const linkClassName = expanded
        ? expandedLinkClassName
        : compactLinkClassName;
    return (
        <div className="flex flex-col gap-4 lg:gap-6">
            {getNavSections(username).map((section) => (
                <div key={section.label ?? ""}>
                    {section.label !== null &&
                        (expanded ? (
                            <h2 className={expandedHeadingClassName}>
                                {section.label}
                            </h2>
                        ) : (
                            <>
                                {/* A divider instead of the label below lg */}
                                <hr
                                    className="mx-2 mb-4 border-default lg:hidden"
                                    aria-hidden
                                />
                                <h2 className={compactHeadingClassName}>
                                    {section.label}
                                </h2>
                            </>
                        ))}
                    <ul className="flex flex-col gap-1">
                        {section.items.map(
                            ({ href, label, shortLabel, icon: Icon }) => {
                                const isActive = isActivePath(href, pathname);
                                const newCount =
                                    href === null ? 0 : (newCounts[href] ?? 0);
                                const count =
                                    newCount > 0 ? formatCount(newCount) : null;
                                const content = (
                                    <>
                                        <span className="relative shrink-0">
                                            <Icon
                                                className="size-5"
                                                aria-hidden
                                            />
                                            {/* On the icon in the compact
                                                sidebar below lg */}
                                            {count && !expanded && (
                                                <span
                                                    className={`${countClassName} absolute -top-2 -right-3 flex lg:hidden`}
                                                    aria-hidden
                                                >
                                                    {count}
                                                </span>
                                            )}
                                        </span>
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
                                        {/* At the end of the row */}
                                        {count && (
                                            <span
                                                className={`${countClassName} ml-auto ${
                                                    expanded
                                                        ? "flex"
                                                        : "hidden lg:flex"
                                                }`}
                                                aria-hidden
                                            >
                                                {count}
                                            </span>
                                        )}
                                        {count && (
                                            <span className="sr-only">
                                                , {newCount} new
                                            </span>
                                        )}
                                    </>
                                );
                                return (
                                    <li key={label}>
                                        {href === null ? (
                                            // Not a link until the href is known
                                            <span className={linkClassName}>
                                                {content}
                                            </span>
                                        ) : (
                                            <Link
                                                href={href}
                                                aria-current={
                                                    isActive
                                                        ? "page"
                                                        : undefined
                                                }
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
                </div>
            ))}
        </div>
    );
}

// username is the signed-in user's, for the Profile link.
// newNotifications: how many of their notifications are new, shown by
// Notifications when there are any.
// unreadMessages: how many messages to them are unread, shown by Messages
// when there are any. Checked again every so often, as messages don't
// notify.
// expanded: always show the full labels, e.g. in the mobile menu drawer.
export function NavLinks({
    username,
    newNotifications,
    unreadMessages,
    expanded = false,
}: {
    username: string;
    newNotifications: number;
    unreadMessages: number;
    expanded?: boolean;
}) {
    return (
        <NavLinkList
            pathname={usePathname()}
            username={username}
            newNotifications={newNotifications}
            unreadMessages={useUnreadMessageCount(unreadMessages)}
            expanded={expanded}
        />
    );
}

// Rendered while the pathname and session are unknown during prerendering,
// without active state or Profile link
export function NavLinksFallback({ expanded = false }: { expanded?: boolean }) {
    return (
        <NavLinkList
            pathname={null}
            username={null}
            newNotifications={0}
            unreadMessages={0}
            expanded={expanded}
        />
    );
}
