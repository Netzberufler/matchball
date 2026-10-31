import { Suspense } from "react";
import type { Metadata } from "next";
import { BackButton } from "@/components/ui/back-button";
import { WhoToFollow } from "@/features/follows/components/who-to-follow";
import { PopularFeed } from "@/features/posts/components/feeds";
import { PostListFallback } from "@/features/posts/components/post-list";
import { UserListFallback } from "@/features/profile/components/user-list";
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
// posts found; without a query, popular posts and people to follow. Both
// read the URL, which is only known at request time, so they're inside
// <Suspense>.
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
        return <ExploreHome />;
    }
    return (
        // A new query starts over, with its own loading state
        <Suspense key={query} fallback={<SearchResultsFallback />}>
            <SearchResults query={query} />
        </Suspense>
    );
}

// What the page shows before a search. Each section loads on its own.
function ExploreHome() {
    return (
        <>
            <section aria-labelledby="who-to-follow-heading">
                <h2
                    id="who-to-follow-heading"
                    className="mb-3 text-lg font-semibold"
                >
                    Who to Follow
                </h2>
                <Suspense fallback={<UserListFallback />}>
                    <WhoToFollow />
                </Suspense>
            </section>
            <section aria-labelledby="popular-heading">
                <h2 id="popular-heading" className="mb-3 text-lg font-semibold">
                    Popular Posts
                </h2>
                <Suspense fallback={<PostListFallback />}>
                    <PopularFeed />
                </Suspense>
            </section>
        </>
    );
}
