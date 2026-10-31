"use client";

import { EmptyCard } from "@/components/ui/list-card";
import { LoadMore } from "@/components/ui/load-more";
import { loadMoreFollows } from "@/features/follows/actions/load-more-follows";
import type { FollowListUser } from "@/features/follows/lib/queries";
import type { FollowListKind } from "@/features/follows/utils/follow-list";
import { type FeedPage, mergeLatestPage } from "@/features/posts/utils/feed";
import {
    UserList,
    UserListFallback,
} from "@/features/profile/components/user-list";
import { usePagedList } from "@/lib/use-paged-list";

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
    const { page, loadMore, isPending, error } = usePagedList({
        firstPage,
        merge: mergeLatestPage,
        load: (cursor) => loadMoreFollows(kind, userId, cursor),
        errorMessage: "Couldn't load more people. Please try again.",
    });

    if (page.items.length === 0) {
        return <EmptyCard>{emptyMessage}</EmptyCard>;
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
