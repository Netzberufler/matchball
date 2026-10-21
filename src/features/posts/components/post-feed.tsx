"use client";

import { useState, useTransition } from "react";
import { Button, Spinner } from "@heroui/react";
import { loadMorePosts } from "@/features/posts/actions/load-more-posts";
import type { FeedPost } from "@/features/posts/lib/queries";
import {
    appendPage,
    type FeedPage,
    type FeedType,
    mergeLatestPage,
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
    feed: FeedType;
    firstPage: FeedPage<FeedPost>;
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
            <PostList posts={page.posts} emptyMessage={emptyMessage} />

            {page.nextCursor ? (
                <div className="flex flex-col items-center gap-2">
                    {/* Same height as the button, so nothing jumps */}
                    <div className="flex h-10 items-center md:h-9">
                        {isPending ? (
                            <Spinner
                                role="status"
                                aria-label="Loading more posts"
                            />
                        ) : (
                            <Button variant="tertiary" onPress={loadMore}>
                                Load more
                            </Button>
                        )}
                    </div>
                    {error && (
                        <p className="text-sm text-danger" role="alert">
                            {error}
                        </p>
                    )}
                </div>
            ) : (
                page.posts.length > 0 && (
                    <p className="text-center text-sm text-muted">
                        You&apos;ve reached the end. No more posts to show.
                    </p>
                )
            )}
        </div>
    );
}
