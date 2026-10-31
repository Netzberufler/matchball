"use client";

import { useState, useTransition } from "react";
import { LoadMore } from "@/components/ui/load-more";
import { loadMorePosts } from "@/features/posts/actions/load-more-posts";
import type { FeedPost } from "@/features/posts/lib/queries";
import {
    appendPage,
    type Feed,
    type FeedPage,
    mergeLatestPage,
    type PostCursor,
} from "@/features/posts/utils/feed";
import { PostList } from "./post-list";

// A feed that starts with the first page from the server and loads more
// pages on request. When the server sends a new first page (a refresh, or
// a new post), its new posts are added at the top.
export function PostFeed({
    feed,
    firstPage,
    emptyMessage,
}: {
    feed: Feed;
    firstPage: FeedPage<FeedPost, PostCursor>;
    emptyMessage: string;
}) {
    const [page, setPage] = useState(firstPage);
    const [shownFirstPage, setShownFirstPage] = useState(firstPage);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // A new first page from the server: merge it in while rendering, as
    // React recommends for state that follows props
    if (firstPage !== shownFirstPage) {
        setShownFirstPage(firstPage);
        setPage(mergeLatestPage(page, firstPage));
    }

    function loadMore() {
        const cursor = page.nextCursor;
        if (!cursor) {
            return;
        }
        setError(null);
        startTransition(async () => {
            try {
                const nextPage = await loadMorePosts(feed, cursor);
                setPage((current) => appendPage(current, nextPage));
            } catch {
                setError("Couldn't load more posts. Please try again.");
            }
        });
    }

    return (
        <div className="flex flex-col gap-4">
            <PostList posts={page.items} emptyMessage={emptyMessage} />

            {page.nextCursor ? (
                <LoadMore
                    isPending={isPending}
                    onPress={loadMore}
                    error={error}
                    loadingLabel="Loading more posts"
                />
            ) : (
                page.items.length > 0 && (
                    <p className="text-center text-sm text-muted">
                        You&apos;ve reached the end. No more posts to show.
                    </p>
                )
            )}
        </div>
    );
}
