import { Card, EmptyState, Skeleton } from "@heroui/react";
import { ViewerProvider } from "@/features/auth/components/viewer-provider";
import { requireSession } from "@/features/auth/lib/session";
import { PostFeed } from "@/features/posts/components/post-feed";
import { PostListFallback } from "@/features/posts/components/post-list";
import { getFeedPage } from "@/features/posts/lib/queries";
import { UserListFallback } from "@/features/profile/components/user-list";
import { searchUsers } from "@/features/search/lib/queries";
import { UserSearchResults } from "./user-search-results";

// What the Explore page found for a normalized query: the people first, as
// they're few and quick to scan, then the posts, newest first. Each list
// loads more on request, and is left out when nothing was found. Reads the
// session and the database at request time, so render it inside
// <Suspense> with <SearchResultsFallback />.
export async function SearchResults({ query }: { query: string }) {
    const { user } = await requireSession();
    const feed = { type: "search", query } as const;
    const [users, posts] = await Promise.all([
        searchUsers(query),
        getFeedPage(feed, user.id),
    ]);

    if (users.items.length === 0 && posts.items.length === 0) {
        return (
            <Card>
                <EmptyState className="text-center">
                    No people or posts match &ldquo;{query}&rdquo;.
                </EmptyState>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {users.items.length > 0 && (
                <section aria-labelledby="people-heading">
                    <h2
                        id="people-heading"
                        className="mb-3 text-lg font-semibold"
                    >
                        People
                    </h2>
                    <UserSearchResults query={query} firstPage={users} />
                </section>
            )}
            {posts.items.length > 0 && (
                <section aria-labelledby="posts-heading">
                    <h2
                        id="posts-heading"
                        className="mb-3 text-lg font-semibold"
                    >
                        Posts
                    </h2>
                    {/* For the posts' reply forms, like in the feeds */}
                    <ViewerProvider
                        viewer={{ name: user.name, image: user.image }}
                    >
                        <PostFeed
                            feed={feed}
                            firstPage={posts}
                            // Not shown: the section is left out instead
                            emptyMessage=""
                        />
                    </ViewerProvider>
                </section>
            )}
        </div>
    );
}

// Shown while the results load; the shape of SearchResults
export function SearchResultsFallback() {
    return (
        <div className="flex flex-col gap-6" aria-hidden>
            <div>
                <Skeleton className="mb-3 h-6 w-20 rounded-full" />
                <UserListFallback count={2} />
            </div>
            <div>
                <Skeleton className="mb-3 h-6 w-16 rounded-full" />
                <PostListFallback />
            </div>
        </div>
    );
}
