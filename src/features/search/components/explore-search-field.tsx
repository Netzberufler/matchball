"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchField, Spinner } from "@heroui/react";
import {
    normalizeSearchQuery,
    SEARCH_PARAM,
    SEARCH_QUERY_MAX_LENGTH,
} from "@/features/search/utils/search-query";

// How long typing has to pause before the results follow
const SEARCH_DELAY_MS = 300;

// The Explore page's search field. The query goes into the URL (?q=) a
// moment after typing stops, or at once on Enter, and the page shows the
// results for it. Until they're there, a spinner takes the search icon's
// place, while the previous results stay. Replaces the URL instead of
// adding history entries, so Back leaves the page instead of going through
// every query typed. Reads the URL, so render it inside <Suspense> with
// <ExploreSearchFieldFallback />.
export function ExploreSearchField() {
    const router = useRouter();
    const pathname = usePathname();
    const urlQuery = normalizeSearchQuery(useSearchParams().get(SEARCH_PARAM));
    const [value, setValue] = useState(urlQuery);
    const [shownUrlQuery, setShownUrlQuery] = useState(urlQuery);
    const [isPending, startTransition] = useTransition();

    // The URL changed elsewhere (Back, Forward, a link): show its query,
    // unless the field already holds it, maybe with spaces still being
    // typed. Done while rendering, as React recommends for state that
    // follows props.
    if (urlQuery !== shownUrlQuery) {
        setShownUrlQuery(urlQuery);
        if (normalizeSearchQuery(value) !== urlQuery) {
            setValue(urlQuery);
        }
    }

    function search(text: string) {
        const query = normalizeSearchQuery(text);
        if (query === urlQuery) {
            return;
        }
        startTransition(() => {
            router.replace(
                query
                    ? `${pathname}?${new URLSearchParams({ [SEARCH_PARAM]: query })}`
                    : pathname,
                { scroll: false },
            );
        });
    }

    useEffect(() => {
        const timeout = setTimeout(() => search(value), SEARCH_DELAY_MS);
        return () => clearTimeout(timeout);
        // Only typing starts the timer; `search` changes with every render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
        <ExploreSearchFieldView
            value={value}
            onChange={setValue}
            onSubmit={search}
            isPending={isPending}
        />
    );
}

// Shown until the URL is known; looks like the field, empty
export function ExploreSearchFieldFallback() {
    return <ExploreSearchFieldView value="" isReadOnly />;
}

function ExploreSearchFieldView({
    isPending = false,
    ...fieldProps
}: {
    value: string;
    onChange?: (value: string) => void;
    onSubmit?: (value: string) => void;
    isReadOnly?: boolean;
    isPending?: boolean;
}) {
    return (
        <SearchField
            {...fieldProps}
            aria-label="Search people and posts"
            maxLength={SEARCH_QUERY_MAX_LENGTH}
            fullWidth
        >
            <SearchField.Group>
                {isPending ? (
                    <SearchField.SearchIcon>
                        <Spinner
                            size="sm"
                            color="current"
                            role="status"
                            aria-label="Searching"
                        />
                    </SearchField.SearchIcon>
                ) : (
                    <SearchField.SearchIcon />
                )}
                <SearchField.Input placeholder="Search people and posts" />
                <SearchField.ClearButton />
            </SearchField.Group>
        </SearchField>
    );
}
