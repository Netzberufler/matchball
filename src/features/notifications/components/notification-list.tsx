"use client";

import { useState, useTransition } from "react";
import { Card, EmptyState, Skeleton } from "@heroui/react";
import { LoadMore } from "@/components/ui/load-more";
import { loadMoreNotifications } from "@/features/notifications/actions/load-more-notifications";
import type { UserNotification } from "@/features/notifications/lib/queries";
import { appendPage, type FeedPage } from "@/features/posts/utils/feed";
import { NotificationItem } from "./notification-item";

// The signed-in user's notifications, newest first, with more loaded on
// request
export function NotificationList({
    firstPage,
}: {
    firstPage: FeedPage<UserNotification>;
}) {
    const [page, setPage] = useState(firstPage);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function loadMore() {
        const cursor = page.nextCursor;
        if (!cursor) {
            return;
        }
        setError(null);
        startTransition(async () => {
            try {
                const nextPage = await loadMoreNotifications(cursor);
                setPage((current) => appendPage(current, nextPage));
            } catch {
                setError("Couldn't load more notifications. Please try again.");
            }
        });
    }

    if (page.items.length === 0) {
        return (
            <Card>
                <EmptyState className="text-center">
                    No notifications yet. Replies, likes and mentions will show
                    up here.
                </EmptyState>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <Card className="gap-0 overflow-hidden p-0">
                <ul className="divide-y divide-separator">
                    {page.items.map((notification) => (
                        <li key={notification.id}>
                            <NotificationItem notification={notification} />
                        </li>
                    ))}
                </ul>
            </Card>
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
        <Card className="gap-0 p-0" aria-hidden>
            <ul className="divide-y divide-separator">
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
            </ul>
        </Card>
    );
}
