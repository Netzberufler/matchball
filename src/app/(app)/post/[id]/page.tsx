import { Suspense } from "react";
import type { Metadata } from "next";
import { BackButton } from "@/components/ui/back-button";
import { PostDetailFallback } from "@/features/posts/components/post-detail";
import { PostView } from "@/features/posts/components/post-view";
import { getPost } from "@/features/posts/lib/queries";

export async function generateMetadata({
    params,
}: PageProps<"/post/[id]">): Promise<Metadata> {
    const { id } = await params;
    const post = await getPost(id);
    return {
        title: post
            ? `${post.author.name} (@${post.author.username})`
            : "Post not found",
    };
}

// The params are only known at request time, so everything that reads them
// is inside <Suspense>
export default function PostPage({ params }: PageProps<"/post/[id]">) {
    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                <BackButton />
                <h1 className="text-xl font-semibold">Post</h1>
            </div>
            <Suspense fallback={<PostDetailFallback />}>
                {params.then(({ id }) => (
                    <PostView id={id} />
                ))}
            </Suspense>
        </>
    );
}
