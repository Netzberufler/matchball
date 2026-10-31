"use client";

import { useState, useTransition } from "react";
import { Button, Card, EmptyState, Tabs } from "@heroui/react";
import {
    AtSign,
    Bell,
    Heart,
    MessageCircle,
    Swords,
    UserPlus,
} from "lucide-react";
import { loadNotifications } from "@/features/notifications/actions/load-notifications";
import type { UserNotification } from "@/features/notifications/lib/queries";
import {
    isNotificationFilter,
    NOTIFICATION_FILTERS,
    type NotificationFilter,
} from "@/features/notifications/utils/notification-filters";
import type { FeedPage } from "@/features/posts/utils/feed";
import {
    NotificationList,
    NotificationListFallback,
} from "./notification-list";

type Page = FeedPage<UserNotification>;

// The icons of the notifications each tab shows; "All" has the icon of
// Notifications in the main nav
const FILTER_ICONS = {
    all: Bell,
    followers: UserPlus,
    mentions: AtSign,
    replies: MessageCircle,
    likes: Heart,
    matches: Swords,
} satisfies Record<NotificationFilter, unknown>;

// The notifications, filtered by the selected tab. "All" starts with
// `firstPage`; the other tabs load their first page when they're first
// opened, and every tab keeps what it loaded while switching between them.
// Without `firstPage` (while the page loads), the tabs are disabled and
// show placeholders.
export function NotificationTabs({ firstPage }: { firstPage: Page | null }) {
    const [selected, setSelected] = useState<NotificationFilter>("all");
    const [pages, setPages] = useState<
        Partial<Record<NotificationFilter, Page>>
    >(firstPage ? { all: firstPage } : {});
    // By tab: its first page couldn't be loaded
    const [failed, setFailed] = useState<
        Partial<Record<NotificationFilter, boolean>>
    >({});
    const [, startTransition] = useTransition();

    function loadFirstPage(filter: NotificationFilter) {
        setFailed((current) => ({ ...current, [filter]: false }));
        startTransition(async () => {
            try {
                const page = await loadNotifications(filter, null);
                setPages((current) => ({ ...current, [filter]: page }));
            } catch {
                setFailed((current) => ({ ...current, [filter]: true }));
            }
        });
    }

    function select(key: unknown) {
        if (!isNotificationFilter(key)) {
            return;
        }
        setSelected(key);
        if (!pages[key]) {
            loadFirstPage(key);
        }
    }

    return (
        <Tabs
            selectedKey={selected}
            onSelectionChange={select}
            isDisabled={!firstPage}
        >
            {/* Only as wide as the tabs, at the start; scrolls when the
                screen is narrower */}
            <Tabs.ListContainer className="w-fit max-w-full self-start">
                <Tabs.List aria-label="Filter notifications">
                    {NOTIFICATION_FILTERS.map(({ key, label }) => {
                        const Icon = FILTER_ICONS[key];
                        return (
                            <Tabs.Tab key={key} id={key} className="gap-1.5">
                                <Icon className="size-4" aria-hidden />
                                {label}
                                {/* Without the sliding animation, which can
                                    leave it off its tab when the page
                                    appears, like in the old auth tabs */}
                                <Tabs.Indicator className="transition-none" />
                            </Tabs.Tab>
                        );
                    })}
                </Tabs.List>
            </Tabs.ListContainer>
            {NOTIFICATION_FILTERS.map(({ key }) => {
                const page = pages[key];
                return (
                    <Tabs.Panel
                        key={key}
                        id={key}
                        // Flush with the tab list, without the default padding
                        className="px-0 pt-4 pb-0"
                    >
                        {page ? (
                            <NotificationList
                                filter={key}
                                page={page}
                                onPageChange={(update) =>
                                    setPages((current) => ({
                                        ...current,
                                        [key]: update(current[key] ?? page),
                                    }))
                                }
                            />
                        ) : failed[key] ? (
                            <Card>
                                <EmptyState className="flex flex-col items-center gap-3 text-center">
                                    <p role="alert">
                                        Couldn&apos;t load these notifications.
                                    </p>
                                    <Button
                                        variant="tertiary"
                                        onPress={() => loadFirstPage(key)}
                                    >
                                        Try again
                                    </Button>
                                </EmptyState>
                            </Card>
                        ) : (
                            <NotificationListFallback />
                        )}
                    </Tabs.Panel>
                );
            })}
        </Tabs>
    );
}

// Shown while the notifications load; the shape of NotificationTabs
export function NotificationTabsFallback() {
    return <NotificationTabs firstPage={null} />;
}
