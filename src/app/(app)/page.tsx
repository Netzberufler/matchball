import { Suspense } from "react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ViewerAvatar } from "@/features/auth/components/viewer-avatar";
import { getViewerName, requireSession } from "@/features/auth/lib/session";
import { HomeFeed } from "@/features/posts/components/feeds";
import { PostForm } from "@/features/posts/components/post-form";
import { PostListFallback } from "@/features/posts/components/post-list";
import { RefreshFeedButton } from "@/features/posts/components/refresh-feed-button";
import { hasPostsByFollowedAuthors } from "@/features/posts/lib/queries";
import { DiscoverSections } from "@/features/search/components/discover-sections";

export default function Home() {
    return (
        <>
            <h1 className="text-xl mb-4 font-semibold">
                {/* Reads the session. Holds the line height until then, so
                    the greeting appears at once instead of in two steps. */}
                <Suspense
                    fallback={<span className="invisible">Welcome!</span>}
                >
                    <Welcome />
                </Suspense>
            </h1>
            <div className="flex flex-col gap-6">
                <PostForm
                    // Reads the session; the form itself shows right away
                    avatar={
                        <Suspense fallback={<UserAvatar />}>
                            <ViewerAvatar />
                        </Suspense>
                    }
                />
                <section aria-labelledby="feed-heading">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h2
                            id="feed-heading"
                            className="text-lg font-semibold"
                        >
                            Your feed
                        </h2>
                        <RefreshFeedButton />
                    </div>
                    <Suspense fallback={<PostListFallback />}>
                        <HomeFeed />
                    </Suspense>
                </section>
                {/* Below the feed, so nothing above it moves when it
                    appears */}
                <Suspense>
                    <HomeDiscover />
                </Suspense>
            </div>
        </>
    );
}

async function Welcome() {
    return `Welcome, ${await getViewerName()}!`;
}

// People to follow and popular posts, while nobody the viewer follows has
// posted (or they follow nobody yet), so their feed holds nothing to read
async function HomeDiscover() {
    const { user } = await requireSession();
    if (await hasPostsByFollowedAuthors(user.id)) {
        return null;
    }
    return <DiscoverSections />;
}
