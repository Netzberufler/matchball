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
import { useFeedPage } from "@/features/posts/utils/use-feed-page";
import { PostList } from "./post-list";

// A feed that starts with the first page from the server and loads more
// pages on request. When the server sends a new first page (a refresh, or
// a new post), its new posts are added at the top, and the posts shown take
// its version of them.
export function PostFeed({
    feed,
    firstPage,
    emptyMessage,
}: {
    feed: Feed;
    firstPage: FeedPage<FeedPost, PostCursor>;
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
