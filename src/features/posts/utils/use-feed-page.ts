"use client";

import { useState } from "react";
import type { FeedPage } from "./feed";

// The shown items of a list that loads more pages on request, starting with
// `firstPage` from the server. When the server sends a new first page (the
// page was refreshed, e.g. after a change), `merge` puts it into what's
// shown, so the list shows the latest data instead of what it got first.
// Done while rendering, as React recommends for state that follows props.
export function useFeedPage<Page extends FeedPage<{ id: string }, unknown>>(
    firstPage: Page,
    merge: (current: Page, latest: Page) => Page,
) {
    const [page, setPage] = useState(firstPage);
    const [shownFirstPage, setShownFirstPage] = useState(firstPage);
    if (firstPage !== shownFirstPage) {
        setShownFirstPage(firstPage);
        setPage(merge(page, firstPage));
    }
    return [page, setPage] as const;
}
