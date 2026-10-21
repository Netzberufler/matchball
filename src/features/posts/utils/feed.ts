// Feed paging, shared by the feed queries, the loadMorePosts action and the
// feed component

export const FEED_PAGE_SIZE = 10;

// "home": the posts the viewer follows; "user": one author's posts, for
// their profile page
export type Feed = { type: "home" } | { type: "user"; authorId: string };

// Points at the last post of a page; the next page starts after it
export type FeedCursor = { createdAt: Date; id: string };

export type FeedPage<Post> = {
    posts: Post[];
    // null on the last page
    nextCursor: FeedCursor | null;
};

type FeedItem = { id: string };

// Puts a freshly loaded first page on top of the posts already shown, e.g.
// after a refresh or a new post. Posts that are already shown keep their
// place, so the pages loaded further down stay. If the fresh page doesn't
// reach the shown posts, there could be a gap between them, so the feed
// starts over from the fresh page.
export function mergeLatestPage<Post extends FeedItem>(
    current: FeedPage<Post>,
    latest: FeedPage<Post>,
): FeedPage<Post> {
    const shownIds = new Set(current.posts.map((post) => post.id));
    if (!latest.posts.some((post) => shownIds.has(post.id))) {
        return latest;
    }
    const newPosts = latest.posts.filter((post) => !shownIds.has(post.id));
    return { ...current, posts: [...newPosts, ...current.posts] };
}

// Adds the next page below the posts already shown
export function appendPage<Post extends FeedItem>(
    current: FeedPage<Post>,
    next: FeedPage<Post>,
): FeedPage<Post> {
    const shownIds = new Set(current.posts.map((post) => post.id));
    return {
        posts: [
            ...current.posts,
            ...next.posts.filter((post) => !shownIds.has(post.id)),
        ],
        nextCursor: next.nextCursor,
    };
}
