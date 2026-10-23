import { notFound } from "next/navigation";
import { Card } from "@heroui/react";
import { ViewerProvider } from "@/features/auth/components/viewer-provider";
import { requireSession } from "@/features/auth/lib/session";
import { PostComments } from "@/features/comments/components/post-comments";
import { getCommentPage } from "@/features/comments/lib/queries";
import { getPost } from "@/features/posts/lib/queries";
import { PostDetail } from "./post-detail";

// One post on its own page, with the reply form and the replies below it;
// a 404 if there's no such post. Reads the session
// and the database at request time, so render it inside <Suspense> with
// <PostDetailFallback />.
export async function PostView({ id }: { id: string }) {
    const { user } = await requireSession();
    // In parallel: a post that doesn't exist simply has no comments
    const [post, firstCommentPage] = await Promise.all([
        getPost(id, user.id),
        getCommentPage(id, user.id),
    ]);
    if (!post) {
        notFound();
    }

    // ViewerProvider gives the reply forms the signed-in user, for their
    // avatar
    return (
        <ViewerProvider viewer={{ name: user.name, image: user.image }}>
            <div className="flex flex-col gap-4">
                <Card className="gap-0 p-0">
                    <PostDetail post={post} />
                </Card>
                <PostComments postId={post.id} firstPage={firstCommentPage} />
            </div>
        </ViewerProvider>
    );
}
