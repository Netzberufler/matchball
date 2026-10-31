"use client";

import { useState, useTransition } from "react";
import { Card, EmptyState } from "@heroui/react";
import { LoadMore } from "@/components/ui/load-more";
import { loadMoreFollows } from "@/features/follows/actions/load-more-follows";
import type { FollowListUser } from "@/features/follows/lib/queries";
import type { FollowListKind } from "@/features/follows/utils/follow-list";
import {
    appendPage,
    type FeedPage,
    mergeLatestPage,
} from "@/features/posts/utils/feed";
import { useFeedPage } from "@/features/posts/utils/use-feed-page";
import {
    UserList,
    UserListFallback,
} from "@/features/profile/components/user-list";

// A user's followers, or whom they follow, newest first, with more loaded
// on request. Each person links to their profile.
export function FollowList({
    kind,
    userId,
    firstPage,
    emptyMessage,
}: {
    kind: FollowListKind;
    userId: string;
    firstPage: FeedPage<FollowListUser>;
    emptyMessage: string;
}) {
    const [page, setPage] = useFeedPage(firstPage, mergeLatestPage);
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
                const nextPage = await loadMoreFollows(kind, userId, cursor);
                setPage((current) => appendPage(current, nextPage));
            } catch {
                setError("Couldn't load more people. Please try again.");
            }
        });
    }

    if (page.items.length === 0) {
        return (
            <Card>
                <EmptyState className="text-center">{emptyMessage}</EmptyState>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <UserList users={page.items} />
            {page.nextCursor && (
                <LoadMore
                    isPending={isPending}
                    onPress={loadMore}
                    error={error}
                    loadingLabel="Loading more people"
                />
            )}
        </div>
    );
}

// Shown while a follow list loads
export function FollowListFallback() {
    return <UserListFallback />;
}
