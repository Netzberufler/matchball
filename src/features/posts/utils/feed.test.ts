import { describe, expect, it } from "vitest";
import {
    appendPage,
    FEED_PAGE_SIZE,
    type FeedCursor,
    type FeedPage,
    mergeLatestPage,
    newerThan,
    olderThan,
    toPage,
} from "@/features/posts/utils/feed";

type Item = { id: string };

const CURSOR: FeedCursor = {
    createdAt: new Date("2026-10-12T10:00:00Z"),
    id: "c",
};

// A page of items with these ids
function page(ids: string[], nextCursor: FeedCursor | null = null) {
    return { items: ids.map((id) => ({ id })), nextCursor };
}

function ids(feedPage: FeedPage<Item>) {
    return feedPage.items.map((item) => item.id);
}

describe("mergeLatestPage", () => {
    it("puts new items on top and keeps the pages loaded below", () => {
        const merged = mergeLatestPage(
            page(["c", "b", "a"], CURSOR),
            page(["e", "d", "c"]),
        );
        expect(ids(merged)).toEqual(["e", "d", "c", "b", "a"]);
        expect(merged.nextCursor).toBe(CURSOR);
    });

    it("shows the fresh version of items that are already shown", () => {
        const merged = mergeLatestPage(
            {
                items: [
                    { id: "b", name: "Old" },
                    { id: "a", name: "Old" },
                ],
                nextCursor: CURSOR,
            },
            { items: [{ id: "b", name: "New" }], nextCursor: null },
        );
        expect(merged.items).toEqual([
            { id: "b", name: "New" },
            { id: "a", name: "Old" },
        ]);
    });

    it("keeps the list when nothing is new", () => {
        const current = page(["c", "b", "a"], CURSOR);
        expect(mergeLatestPage(current, page(["c", "b"]))).toEqual(current);
    });

    it("starts over from the fresh page when it doesn't reach the shown items", () => {
        const latest = page(["z", "y"], CURSOR);
        expect(mergeLatestPage(page(["b", "a"]), latest)).toBe(latest);
    });

    it("starts over from an empty fresh page", () => {
        const latest = page([]);
        expect(mergeLatestPage(page(["b", "a"], CURSOR), latest)).toBe(latest);
    });
});

describe("appendPage", () => {
    it("adds the next page below with its cursor", () => {
        const next = { ...CURSOR, id: "a" };
        const appended = appendPage(
            page(["d", "c"], CURSOR),
            page(["b", "a"], next),
        );
        expect(ids(appended)).toEqual(["d", "c", "b", "a"]);
        expect(appended.nextCursor).toBe(next);
    });

    it("skips items that are already shown", () => {
        const appended = appendPage(page(["d", "c"]), page(["c", "b"]));
        expect(ids(appended)).toEqual(["d", "c", "b"]);
    });

    it("ends the list after the last page", () => {
        expect(
            appendPage(page(["b"], CURSOR), page(["a"])).nextCursor,
        ).toBeNull();
    });
});

describe("olderThan", () => {
    it("selects older items, and just as old ones with a smaller id", () => {
        expect(olderThan(CURSOR)).toEqual({
            OR: [
                { createdAt: { lt: CURSOR.createdAt } },
                { createdAt: CURSOR.createdAt, id: { lt: "c" } },
            ],
        });
    });
});

describe("newerThan", () => {
    it("selects newer items, and just as old ones with a larger id", () => {
        expect(newerThan(CURSOR)).toEqual({
            OR: [
                { createdAt: { gt: CURSOR.createdAt } },
                { createdAt: CURSOR.createdAt, id: { gt: "c" } },
            ],
        });
    });
});

describe("toPage", () => {
    // Rows a minute apart, newest first
    function rows(count: number) {
        return Array.from({ length: count }, (_, i) => ({
            id: `row${i}`,
            createdAt: new Date(Date.UTC(2026, 9, 12, 10, 59 - i)),
        }));
    }

    it("drops the extra row and points the cursor at the last item", () => {
        const fetched = rows(FEED_PAGE_SIZE + 1);
        const result = toPage(fetched);
        expect(result.items).toEqual(fetched.slice(0, FEED_PAGE_SIZE));
        expect(result.nextCursor).toEqual({
            createdAt: fetched[FEED_PAGE_SIZE - 1]!.createdAt,
            id: `row${FEED_PAGE_SIZE - 1}`,
        });
    });

    it("has no cursor on the last page", () => {
        expect(toPage(rows(FEED_PAGE_SIZE))).toEqual({
            items: rows(FEED_PAGE_SIZE),
            nextCursor: null,
        });
        expect(toPage([])).toEqual({ items: [], nextCursor: null });
    });
});
