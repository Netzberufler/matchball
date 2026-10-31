"use client";

import { useState } from "react";
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
import { type FeedPage, mergeLatestPage } from "@/features/posts/utils/feed";
import { useOnDemand } from "@/lib/use-on-demand";
import {
    NotificationList,
    NotificationListFallback,
} from "./notification-list";
import { useMarkSeen } from "./use-mark-seen";

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
// A refreshed page brings a new `firstPage`, merged into "All"; the other
// tabs load theirs again (see useOnDemand).
// Without `firstPage` (while the page loads), the tabs are disabled and
// show placeholders.
export function NotificationTabs({ firstPage }: { firstPage: Page | null }) {
    const [selected, setSelected] = useState<NotificationFilter>("all");
    const pages = useOnDemand<NotificationFilter, Page>({
        load: (filter) => loadNotifications(filter, null),
        shownKey: selected,
        refreshKey: firstPage,
        initial: firstPage ? { all: firstPage } : {},
        merge: mergeLatestPage,
    });
    // The "New" badges clicked away
    const [dismissed, setDismissed] = useState<ReadonlySet<string>>(
        () => new Set(),
    );
    const observeNew = useMarkSeen();

    // What was new when this visit loaded it keeps its badge until the page
    // is left, also once it was marked seen (which refreshes the page) and
    // in tabs loaded after that. Added while rendering, as React recommends
    // for state that follows props.
    const [newIds, setNewIds] = useState<ReadonlySet<string>>(() => new Set());
    const loadedNewIds = NOTIFICATION_FILTERS.flatMap(
        ({ key }) => pages.data(key)?.items ?? [],
    )
        .filter((notification) => notification.isNew)
        .map((notification) => notification.id)
        .filter((id) => !newIds.has(id));
    if (loadedNewIds.length > 0) {
        setNewIds(new Set([...newIds, ...loadedNewIds]));
    }

    function dismiss(id: string) {
        setDismissed((current) => new Set(current).add(id));
    }

    function select(key: unknown) {
        if (!isNotificationFilter(key)) {
            return;
        }
        setSelected(key);
        pages.open(key);
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
                const page = pages.data(key);
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
                                isShownAsNew={(id) =>
                                    newIds.has(id) && !dismissed.has(id)
                                }
                                onDismissNew={dismiss}
                                observeNew={observeNew}
                                onPageChange={(update) =>
                                    pages.update(key, update)
                                }
                            />
                        ) : pages.failed(key) ? (
                            <Card>
                                <EmptyState className="flex flex-col items-center gap-3 text-center">
                                    <p role="alert">
                                        Couldn&apos;t load these notifications.
                                    </p>
                                    <Button
                                        variant="tertiary"
                                        onPress={() => pages.open(key)}
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
