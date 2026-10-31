"use client";

import { useState, useTransition } from "react";
import { appendPage, type FeedPage } from "@/features/posts/utils/feed";

type Page = FeedPage<{ id: string }, unknown>;

// The "Load more" of a list: `loadMore` loads what comes after `cursor`
// (nothing without one, at the end of the list) and hands it to `onLoaded`.
// If loading fails, `error` is `errorMessage` until the next try.
export function useLoadMore<Cursor, Loaded>({
    cursor,
    load,
    onLoaded,
    errorMessage,
}: {
    cursor: Cursor | null;
    load: (cursor: Cursor) => Promise<Loaded>;
    onLoaded: (loaded: Loaded) => void;
    // E.g. "Couldn't load more posts. Please try again."
    errorMessage: string;
}) {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function loadMore() {
        if (cursor === null) {
            return;
        }
        setError(null);
        startTransition(async () => {
            try {
                onLoaded(await load(cursor));
            } catch {
                setError(errorMessage);
            }
        });
    }

    return { loadMore, isPending, error };
}

// A list that starts with `firstPage` from the server and loads more pages
// on request (see useLoadMore), added below with `append`. When the server
// sends a new first page (the page was refreshed, e.g. after a change),
// `merge` puts it into what's shown, so the list shows the latest data
// instead of what it got first. That's done while rendering, as React
// recommends for state that follows props.
export function usePagedList<P extends Page>({
    firstPage,
    merge,
    load,
    // appendPage keeps the page's other fields, e.g. a comment page's
    // replies, but doesn't add to them; pass your own for that
    append = appendPage as unknown as (current: P, next: P) => P,
    errorMessage,
}: {
    firstPage: P;
    merge: (current: P, latest: P) => P;
    load: (cursor: NonNullable<P["nextCursor"]>) => Promise<P>;
    append?: (current: P, next: P) => P;
    errorMessage: string;
}) {
    const [page, setPage] = useState(firstPage);
    const [shownFirstPage, setShownFirstPage] = useState(firstPage);
    if (firstPage !== shownFirstPage) {
        setShownFirstPage(firstPage);
        setPage(merge(page, firstPage));
    }

    const loading = useLoadMore({
        cursor: page.nextCursor as NonNullable<P["nextCursor"]> | null,
        load,
        onLoaded: (next: P) => setPage((current) => append(current, next)),
        errorMessage,
    });

    return { page, setPage, ...loading };
}
