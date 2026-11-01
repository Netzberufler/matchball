"use client";

import { Skeleton } from "@heroui/react";
import { EmptyCard, ListCard } from "@/components/ui/list-card";
import { LoadMore } from "@/components/ui/load-more";
import { loadNotifications } from "@/features/notifications/actions/load-notifications";
import type { UserNotification } from "@/features/notifications/lib/queries";
import type { NotificationFilters } from "@/features/notifications/utils/notification-filters";
import { appendPage, type FeedPage } from "@/features/posts/utils/feed";
import { useLoadMore } from "@/lib/use-paged-list";
import { NotificationItem } from "./notification-item";

// The signed-in user's notifications that `filters` show, newest first, with
// more loaded on request. The feed keeps `page`, so it stays when switching
// filters. `newSince` is when the visit started (see NotificationFeed).
// `observeNew` is given the element of each notification that's new in the
// database, to mark it seen when it scrolls into view (see useMarkSeen).
export function NotificationList({
    filters,
    newSince,
    page,
    emptyMessage,
    isShownAsNew,
    onDismissNew,
    observeNew,
    onPageChange,
}: {
    filters: NotificationFilters;
    newSince: Date;
    page: FeedPage<UserNotification>;
    emptyMessage: string;
    isShownAsNew: (id: string) => boolean;
    onDismissNew: (id: string) => void;
    observeNew: (element: HTMLElement | null) => (() => void) | undefined;
    onPageChange: (
        update: (
            current: FeedPage<UserNotification>,
        ) => FeedPage<UserNotification>,
    ) => void;
}) {
    const { loadMore, isPending, error } = useLoadMore({
        cursor: page.nextCursor,
        load: (cursor) => loadNotifications(filters, cursor, newSince),
        onLoaded: (nextPage) =>
            onPageChange((current) => appendPage(current, nextPage)),
        errorMessage: "Couldn't load more notifications. Please try again.",
    });

    if (page.items.length === 0) {
        return <EmptyCard>{emptyMessage}</EmptyCard>;
    }

    return (
        <div className="flex flex-col gap-4">
            <ListCard>
                {page.items.map((notification) => (
                    <li
                        key={notification.id}
                        ref={notification.isNew ? observeNew : undefined}
                        data-notification-id={notification.id}
                    >
                        <NotificationItem
                            notification={notification}
                            isNew={isShownAsNew(notification.id)}
                            onDismissNew={() => onDismissNew(notification.id)}
                        />
                    </li>
                ))}
            </ListCard>
            {page.nextCursor && (
                <LoadMore
                    isPending={isPending}
                    onPress={loadMore}
                    error={error}
                    loadingLabel="Loading more notifications"
                />
            )}
        </div>
    );
}

// Shown while the notifications load; the shape of NotificationItem
export function NotificationListFallback() {
    return (
        <ListCard aria-hidden>
            {[0, 1, 2].map((index) => (
                <li key={index} className="flex gap-3 p-4">
                    <div className="mr-2 flex h-10 shrink-0 items-center">
                        <Skeleton className="size-5 rounded-full" />
                    </div>
                    <Skeleton className="size-10 shrink-0 rounded-full" />
                    <div className="flex flex-1 flex-col gap-2 pt-1">
                        <Skeleton className="h-3.5 w-48 rounded-full" />
                        <Skeleton className="h-3.5 w-full rounded-full" />
                    </div>
                </li>
            ))}
        </ListCard>
    );
}
