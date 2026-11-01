"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { RetryCard } from "@/components/ui/list-card";
import { loadNotifications } from "@/features/notifications/actions/load-notifications";
import type { UserNotification } from "@/features/notifications/lib/queries";
import {
    countActiveNotificationFilters,
    NO_NOTIFICATION_FILTERS,
    type NotificationFilters,
    notificationFiltersKey,
    notificationsEmptyMessage,
} from "@/features/notifications/utils/notification-filters";
import { type FeedPage, mergeLatestPage } from "@/features/posts/utils/feed";
import { useOnDemand } from "@/lib/use-on-demand";
import {
    NotificationShowMenu,
    NotificationTypeMenu,
} from "./notification-filter-menus";
import {
    NotificationList,
    NotificationListFallback,
} from "./notification-list";
import { useMarkSeen } from "./use-mark-seen";

type Page = FeedPage<UserNotification>;

// What the server sends with the page
const NO_FILTERS_KEY = notificationFiltersKey(NO_NOTIFICATION_FILTERS);

// The notifications, with buttons to filter them by type and to show only
// the new ones. The filters run in the database: the unfiltered list starts
// with `firstPage`, and each combination of filters loads its first page
// when it's first set, and keeps what it loaded while switching back and
// forth. A refreshed page brings a new `firstPage`, merged into the
// unfiltered list; the others load theirs again (see useOnDemand).
// `loadedAt` is when the server rendered the page.
export function NotificationFeed({
    firstPage,
    loadedAt,
}: {
    firstPage: Page;
    loadedAt: Date;
}) {
    const [filters, setFilters] = useState<NotificationFilters>(
        NO_NOTIFICATION_FILTERS,
    );
    // When this visit started, by the server's clock, so the new ones keep
    // showing once they're marked seen (which refreshes the page). Kept
    // from the first render on purpose: a refresh renders `loadedAt` anew.
    const [newSince] = useState(loadedAt);
    const shownKey = notificationFiltersKey(filters);
    const pages = useOnDemand<string, Page>({
        // A key is the filters as JSON (see notificationFiltersKey)
        load: (key) => loadNotifications(JSON.parse(key), null, newSince),
        shownKey,
        refreshKey: firstPage,
        initial: { [NO_FILTERS_KEY]: firstPage },
        merge: mergeLatestPage,
    });
    const page = pages.data(shownKey);
    const isFiltered = countActiveNotificationFilters(filters) > 0;
    // The "New" badges clicked away
    const [dismissed, setDismissed] = useState<ReadonlySet<string>>(
        () => new Set(),
    );
    const observeNew = useMarkSeen();

    // What was new when this visit loaded it keeps its badge until the page
    // is left, also once it was marked seen (which refreshes the page) and
    // with filters set after that. Added while rendering, as React
    // recommends for state that follows props.
    const [newIds, setNewIds] = useState<ReadonlySet<string>>(() => new Set());
    const loadedNewIds = (page?.items ?? [])
        .filter((notification) => notification.isNew)
        .map((notification) => notification.id)
        .filter((id) => !newIds.has(id));
    if (loadedNewIds.length > 0) {
        setNewIds(new Set([...newIds, ...loadedNewIds]));
    }

    function dismiss(id: string) {
        setDismissed((current) => new Set(current).add(id));
    }

    function changeFilters(next: NotificationFilters) {
        setFilters(next);
        pages.open(notificationFiltersKey(next));
    }

    return (
        <div className="flex flex-col gap-3">
            <NotificationToolbar>
                <NotificationTypeMenu
                    types={filters.types}
                    onChange={(types) => changeFilters({ ...filters, types })}
                />
                <NotificationShowMenu
                    show={filters.show}
                    onChange={(show) => changeFilters({ ...filters, show })}
                />
                {isFiltered && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => changeFilters(NO_NOTIFICATION_FILTERS)}
                    >
                        Clear filters
                    </Button>
                )}
            </NotificationToolbar>
            {page ? (
                // Keyed, so "Load more" starts over for other filters
                <NotificationList
                    key={shownKey}
                    filters={filters}
                    newSince={newSince}
                    page={page}
                    emptyMessage={notificationsEmptyMessage(filters)}
                    isShownAsNew={(id) => newIds.has(id) && !dismissed.has(id)}
                    onDismissNew={dismiss}
                    observeNew={observeNew}
                    onPageChange={(update) => pages.update(shownKey, update)}
                />
            ) : pages.failed(shownKey) ? (
                <RetryCard
                    message="Couldn't load these notifications."
                    onRetry={() => pages.open(shownKey)}
                />
            ) : (
                <NotificationListFallback />
            )}
        </div>
    );
}

// The filter buttons above the list
function NotificationToolbar({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

// Shown while the notifications load: the filters, disabled, above
// placeholders
export function NotificationFeedFallback() {
    return (
        <div className="flex flex-col gap-3">
            <NotificationToolbar>
                <NotificationTypeMenu
                    types={NO_NOTIFICATION_FILTERS.types}
                    onChange={() => {}}
                    isDisabled
                />
                <NotificationShowMenu
                    show={NO_NOTIFICATION_FILTERS.show}
                    onChange={() => {}}
                    isDisabled
                />
            </NotificationToolbar>
            <NotificationListFallback />
        </div>
    );
}
