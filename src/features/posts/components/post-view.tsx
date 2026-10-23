import { notFound } from "next/navigation";
import { Card } from "@heroui/react";
import { requireSession } from "@/features/auth/lib/session";
import { getPost } from "@/features/posts/lib/queries";
import { PostDetail } from "./post-detail";

// One post on its own page; a 404 if there's no such post. Reads the session
// and the database at request time, so render it inside <Suspense> with
// <PostDetailFallback />.
export async function PostView({ id }: { id: string }) {
    const { user } = await requireSession();
    const post = await getPost(id, user.id);
    if (!post) {
        notFound();
    }

    return (
        <Card className="gap-0 p-0">
            <PostDetail post={post} />
        </Card>
    );
}
