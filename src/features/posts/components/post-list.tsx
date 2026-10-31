import { Skeleton } from "@heroui/react";
import { EmptyCard, ListCard } from "@/components/ui/list-card";
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
        return <EmptyCard>{emptyMessage}</EmptyCard>;
    }

    // overflow-hidden keeps the posts' hover background inside the corners
    return (
        <ListCard>
            {posts.map((post) => (
                <li key={post.id}>
                    <PostItem post={post} />
                </li>
            ))}
        </ListCard>
    );
}

// Shown while posts load; roughly the size of `count` posts
export function PostListFallback({ count = 3 }: { count?: number }) {
    return (
        <ListCard aria-hidden>
            {Array.from({ length: count }, (_, index) => (
                <li key={index} className="flex gap-3 p-4">
                    <Skeleton className="size-10 shrink-0 rounded-full" />
                    <div className="flex flex-1 flex-col gap-2 pt-1">
                        <Skeleton className="h-3.5 w-40 rounded-full" />
                        <Skeleton className="h-3.5 w-full rounded-full" />
                        <Skeleton className="h-3.5 w-2/3 rounded-full" />
                    </div>
                </li>
            ))}
        </ListCard>
    );
}
