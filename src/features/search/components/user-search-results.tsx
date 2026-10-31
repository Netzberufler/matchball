"use client";

import { useState, useTransition } from "react";
import { LoadMore } from "@/components/ui/load-more";
import { appendPage, type FeedPage } from "@/features/posts/utils/feed";
import { UserList } from "@/features/profile/components/user-list";
import { loadMoreUsers } from "@/features/search/actions/load-more-users";
import type {
    SearchUser,
    UserSearchCursor,
} from "@/features/search/lib/queries";

// The people found for `query`, starting with the first page from the
// server, with more loaded on request
export function UserSearchResults({
    query,
    firstPage,
}: {
    query: string;
    firstPage: FeedPage<SearchUser, UserSearchCursor>;
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
                const nextPage = await loadMoreUsers(query, cursor);
                setPage((current) => appendPage(current, nextPage));
            } catch {
                setError("Couldn't load more people. Please try again.");
            }
        });
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
