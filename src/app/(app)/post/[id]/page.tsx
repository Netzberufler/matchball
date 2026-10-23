import { Suspense } from "react";
import type { Metadata } from "next";
import { PostListFallback } from "@/features/posts/components/post-list";
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
            <h1 className="text-xl mb-4 font-semibold">Post</h1>
            <Suspense fallback={<PostListFallback count={1} />}>
                {params.then(({ id }) => (
                    <PostView id={id} />
                ))}
            </Suspense>
        </>
    );
}
