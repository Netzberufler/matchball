// Paging by (createdAt, id) cursor: newest first for the post feeds, oldest
// first for a post's comments. Shared by their queries, load-more actions
// and components. The actions check cursors with feedCursorSchema in
// src/lib/action-input.ts.

export const FEED_PAGE_SIZE = 10;

// "home": posts by the authors the viewer follows, and the viewer's own;
// "user": one author's posts, for their profile page
export type Feed = { type: "home" } | { type: "user"; authorId: string };

// Points at the last item of a page; the next page starts after it
export type FeedCursor = { createdAt: Date; id: string };

export type FeedPage<Item> = {
    items: Item[];
    // null on the last page
    nextCursor: FeedCursor | null;
};

type FeedItem = { id: string };

// Puts a freshly loaded first page on top of the items already shown, e.g.
// after a refresh or a new post. Items that are already shown keep their
// place, so the pages loaded further down stay. If the fresh page doesn't
// reach the shown items, there could be a gap between them, so the list
// starts over from the fresh page.
export function mergeLatestPage<Item extends FeedItem>(
    current: FeedPage<Item>,
    latest: FeedPage<Item>,
): FeedPage<Item> {
    const shownIds = new Set(current.items.map((item) => item.id));
    if (!latest.items.some((item) => shownIds.has(item.id))) {
        return latest;
    }
    const newItems = latest.items.filter((item) => !shownIds.has(item.id));
    return { ...current, items: [...newItems, ...current.items] };
}

// Adds the next page below the items already shown
export function appendPage<Item extends FeedItem>(
    current: FeedPage<Item>,
    next: FeedPage<Item>,
): FeedPage<Item> {
    const shownIds = new Set(current.items.map((item) => item.id));
    return {
        items: [
            ...current.items,
            ...next.items.filter((item) => !shownIds.has(item.id)),
        ],
        nextCursor: next.nextCursor,
    };
}

// Items after the cursor in list order: older, or just as old with a
// smaller id. A Prisma `where` for posts and comments alike.
export function olderThan(cursor: FeedCursor) {
    return {
        OR: [
            { createdAt: { lt: cursor.createdAt } },
            { createdAt: cursor.createdAt, id: { lt: cursor.id } },
        ],
    };
}

// Items before the cursor in list order, for lists that go oldest first:
// newer, or just as old with a larger id
export function newerThan(cursor: FeedCursor) {
    return {
        OR: [
            { createdAt: { gt: cursor.createdAt } },
            { createdAt: cursor.createdAt, id: { gt: cursor.id } },
        ],
    };
}

// The page of `rows` (fetched with one extra row to tell whether there's
// another page) and the cursor for the next one
export function toPage<Item extends FeedItem & { createdAt: Date }>(
    rows: Item[],
): FeedPage<Item> {
    const hasMore = rows.length > FEED_PAGE_SIZE;
    const items = hasMore ? rows.slice(0, FEED_PAGE_SIZE) : rows;
    const last = items.at(-1);
    return {
        items,
        nextCursor:
            hasMore && last ? { createdAt: last.createdAt, id: last.id } : null,
    };
}
