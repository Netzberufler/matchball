import { notFound } from "next/navigation";
import { Card } from "@heroui/react";
import { requireSession } from "@/features/auth/lib/session";
import { getPost } from "@/features/posts/lib/queries";
import { PostItem } from "./post-item";

// One post on its own page; a 404 if there's no such post. Reads the session
// and the database at request time, so render it inside <Suspense> with
// <PostListFallback count={1} />.
export async function PostView({ id }: { id: string }) {
    const [, post] = await Promise.all([requireSession(), getPost(id)]);
    if (!post) {
        notFound();
    }

    return (
        <Card className="gap-0 p-0">
            {/* Already on the post's page, so not a link to it */}
            <PostItem post={post} linkToPost={false} />
        </Card>
    );
}
