"use client";

import { useState, useTransition } from "react";
import { Card } from "@heroui/react";
import { LoadMore } from "@/components/ui/load-more";
import { loadMoreComments } from "@/features/comments/actions/load-more-comments";
import type { PostComment } from "@/features/comments/lib/queries";
import {
    appendPage,
    type FeedPage,
    prependItem,
} from "@/features/posts/utils/feed";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";

// Below a post on its own page: one card with the reply form on top, then
// the post's comments, newest first, with more loaded on request. The viewer's new comment shows
// up on top right away.
export function PostComments({
    postId,
    firstPage,
}: {
    postId: string;
    firstPage: FeedPage<PostComment>;
}) {
    const [page, setPage] = useState(firstPage);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function loadMore() {
        const cursor = page.nextCursor;
        if (!cursor) {
            return;
        }
        setError(null);
        startTransition(async () => {
            try {
                const nextPage = await loadMoreComments(postId, cursor);
                setPage((current) => appendPage(current, nextPage));
            } catch {
                setError("Couldn't load more replies. Please try again.");
            }
        });
    }

    return (
        <section
            aria-labelledby="replies-heading"
            className="flex flex-col gap-4"
        >
            <h2 id="replies-heading" className="text-lg font-semibold">
                Replies
            </h2>
            {/* The reply form on top of the replies, in one card */}
            <Card className="gap-0 p-0">
                <div className="p-4">
                    <CommentForm
                        postId={postId}
                        onCreated={(comment) =>
                            setPage((current) => prependItem(current, comment))
                        }
                    />
                </div>
                {page.items.length > 0 && (
                    <ul className="divide-y divide-separator border-t border-separator">
                        {page.items.map((comment) => (
                            <li key={comment.id}>
                                <CommentItem comment={comment} />
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
            {page.nextCursor ? (
                <LoadMore
                    isPending={isPending}
                    onPress={loadMore}
                    error={error}
                    loadingLabel="Loading more replies"
                />
            ) : (
                page.items.length > 0 && (
                    <p className="text-center text-sm text-muted">
                        You&apos;ve reached the end. No more replies to show.
                    </p>
                )
            )}
        </section>
    );
}
