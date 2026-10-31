"use client";

import { LoadMore } from "@/components/ui/load-more";
import { type FeedPage, mergeLatestPage } from "@/features/posts/utils/feed";
import { UserList } from "@/features/profile/components/user-list";
import { loadMoreUsers } from "@/features/search/actions/load-more-users";
import type {
    SearchUser,
    UserSearchCursor,
} from "@/features/search/lib/queries";
import { usePagedList } from "@/lib/use-paged-list";

// The people found for `query`, starting with the first page from the
// server, with more loaded on request
export function UserSearchResults({
    query,
    firstPage,
}: {
    query: string;
    firstPage: FeedPage<SearchUser, UserSearchCursor>;
}) {
    const { page, loadMore, isPending, error } = usePagedList({
        firstPage,
        merge: mergeLatestPage,
        load: (cursor) => loadMoreUsers(query, cursor),
        errorMessage: "Couldn't load more people. Please try again.",
    });

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
