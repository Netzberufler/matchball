import { Suspense } from "react";
import type { Metadata } from "next";
import { BackButton } from "@/components/ui/back-button";
import {
    ExploreSearchField,
    ExploreSearchFieldFallback,
} from "@/features/search/components/explore-search-field";
import {
    SearchResults,
    SearchResultsFallback,
} from "@/features/search/components/search-results";
import {
    normalizeSearchQuery,
    SEARCH_PARAM,
} from "@/features/search/utils/search-query";

export const metadata: Metadata = {
    title: "Explore",
};

// The search field and, for the query in the URL (?q=), the people and
// posts found. Both read the URL, which is only known at request time, so
// they're inside <Suspense>.
export default function ExplorePage({ searchParams }: PageProps<"/explore">) {
    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                {/* Always home, as this is a top-level section */}
                <BackButton href="/" />
                <h1 className="text-xl font-semibold">Explore</h1>
            </div>
            <div className="flex flex-col gap-6">
                <Suspense fallback={<ExploreSearchFieldFallback />}>
                    <ExploreSearchField />
                </Suspense>
                <Suspense>
                    {searchParams.then((params) => (
                        <ExploreResults
                            query={normalizeSearchQuery(params[SEARCH_PARAM])}
                        />
                    ))}
                </Suspense>
            </div>
        </>
    );
}

function ExploreResults({ query }: { query: string }) {
    if (!query) {
        return (
            <p className="text-muted">
                Find players by name or username, and posts by what they say.
            </p>
        );
    }
    return (
        // A new query starts over, with its own loading state
        <Suspense key={query} fallback={<SearchResultsFallback />}>
            <SearchResults query={query} />
        </Suspense>
    );
}
