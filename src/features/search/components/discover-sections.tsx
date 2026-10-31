import { Suspense } from "react";
import { WhoToFollow } from "@/features/follows/components/who-to-follow";
import { PopularFeed } from "@/features/posts/components/feeds";
import { PostListFallback } from "@/features/posts/components/post-list";
import { UserListFallback } from "@/features/profile/components/user-list";

// People to follow and popular posts, for finding something to read: on
// the Explore page before a search, and on the home page while the viewer's
// feed has nobody else's posts. Two sections, for a flex column with a gap.
// Each loads on its own.
export function DiscoverSections() {
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
