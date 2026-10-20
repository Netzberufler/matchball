import { Suspense } from "react";
import { HomeFeed } from "@/features/posts/components/feeds";
import { PostForm } from "@/features/posts/components/post-form";
import { PostListFallback } from "@/features/posts/components/post-list";

export default function Home() {
    return (
        <>
            <h1 className="text-xl mb-4 font-semibold">Home</h1>
            <div className="flex flex-col gap-6">
                <PostForm />
                <Suspense fallback={<PostListFallback />}>
                    <HomeFeed />
                </Suspense>
            </div>
        </>
    );
}
