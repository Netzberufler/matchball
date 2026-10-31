"use client";

import { LoadMoreOrEnd } from "@/components/ui/load-more";
import { loadMorePosts } from "@/features/posts/actions/load-more-posts";
import type { FeedPost } from "@/features/posts/lib/queries";
import {
    type Feed,
    type FeedPage,
    mergeLatestPage,
    type PostCursor,
} from "@/features/posts/utils/feed";
import { usePagedList } from "@/lib/use-paged-list";
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
    const { page, loadMore, isPending, error } = usePagedList({
        firstPage,
        merge: mergeLatestPage,
        load: (cursor) => loadMorePosts(feed, cursor),
        errorMessage: "Couldn't load more posts. Please try again.",
    });

    return (
        <div className="flex flex-col gap-4">
            <PostList posts={page.items} emptyMessage={emptyMessage} />

            <LoadMoreOrEnd
                hasMore={page.nextCursor !== null}
                hasItems={page.items.length > 0}
                itemsLabel="posts"
                isPending={isPending}
                onPress={loadMore}
                error={error}
                loadingLabel="Loading more posts"
            />
        </div>
    );
}
