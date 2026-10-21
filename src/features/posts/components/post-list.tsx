import { Card, EmptyState, Skeleton } from "@heroui/react";
import type { FeedPost } from "@/features/posts/lib/queries";
import { PostItem } from "./post-item";

export function PostList({
    posts,
    emptyMessage,
}: {
    posts: FeedPost[];
    emptyMessage: string;
}) {
    if (posts.length === 0) {
        return (
            <Card>
                <EmptyState className="text-center">{emptyMessage}</EmptyState>
            </Card>
        );
    }

    return (
        <Card className="gap-0 p-0">
            <ul className="divide-y divide-separator">
                {posts.map((post) => (
                    <li key={post.id}>
                        <PostItem post={post} />
                    </li>
                ))}
            </ul>
        </Card>
    );
}

// Shown while a feed loads; roughly the size of a few posts
export function PostListFallback() {
    return (
        <Card className="gap-0 p-0" aria-hidden>
            <ul className="divide-y divide-separator">
                {[0, 1, 2].map((index) => (
                    <li key={index} className="flex gap-3 p-4">
                        <Skeleton className="size-10 shrink-0 rounded-full" />
                        <div className="flex flex-1 flex-col gap-2 pt-1">
                            <Skeleton className="h-3.5 w-40 rounded-full" />
                            <Skeleton className="h-3.5 w-full rounded-full" />
                            <Skeleton className="h-3.5 w-2/3 rounded-full" />
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    );
}
