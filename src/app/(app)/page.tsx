import { Suspense } from "react";
import { HomeFeed } from "@/features/posts/components/feeds";
import { PostForm } from "@/features/posts/components/post-form";
import { PostListFallback } from "@/features/posts/components/post-list";
import { RefreshFeedButton } from "@/features/posts/components/refresh-feed-button";

export default function Home() {
    return (
        <>
            <h1 className="sr-only">Home</h1>
            <div className="flex flex-col gap-6">
                <PostForm />
                <section aria-labelledby="following-heading">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h2
                            id="following-heading"
                            className="text-lg font-semibold"
                        >
                            Following
                        </h2>
                        <RefreshFeedButton />
                    </div>
                    <Suspense fallback={<PostListFallback />}>
                        <HomeFeed />
                    </Suspense>
                </section>
            </div>
        </>
    );
}
