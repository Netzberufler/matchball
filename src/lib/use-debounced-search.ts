"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";

// Wait this long after the last keystroke before searching
const SEARCH_DELAY_MS = 150;

type Results<Result> = { query: string; items: Result[] };

const NO_RESULTS: Results<never> = { query: "", items: [] };

// Search as you type: `search` runs for `query` once typing pauses, and
// only the answer for the latest query is kept. The results stay while the
// next search runs, so the list doesn't flicker between keystrokes. An
// empty query doesn't search. A failed search keeps the last results; the
// next keystroke tries again. `onResults` gets the results as they come
// in, e.g. to reset a highlighted suggestion.
export function useDebouncedSearch<Result>(
    query: string,
    search: (query: string) => Promise<Result[]>,
    onResults?: (items: Result[]) => void,
) {
    const [results, setResults] = useState<Results<Result>>(NO_RESULTS);
    // The latest query searched for; older answers are ignored
    const latestQuery = useRef<string | null>(null);
    const runSearch = useEffectEvent(search);
    const showResults = useEffectEvent((found: Results<Result>) => {
        setResults(found);
        onResults?.(found.items);
    });

    useEffect(() => {
        if (!query) {
            return;
        }
        latestQuery.current = query;
        const timeout = setTimeout(() => {
            runSearch(query).then(
                (items) => {
                    if (latestQuery.current === query) {
                        showResults({ query, items });
                    }
                },
                () => {},
            );
        }, SEARCH_DELAY_MS);
        return () => clearTimeout(timeout);
    }, [query]);

    // Forgets the results and any search still running, e.g. when the
    // search is about something else now
    function reset() {
        setResults(NO_RESULTS);
        latestQuery.current = null;
    }

    return {
        results: results.items,
        // The query the results are for
        resultsQuery: results.query,
        // Typed, and its results aren't there yet
        isSearching: query !== "" && results.query !== query,
        reset,
    };
}
