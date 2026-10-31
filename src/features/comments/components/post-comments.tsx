"use client";

import { Card } from "@heroui/react";
import { LoadMoreOrEnd } from "@/components/ui/load-more";
import { loadMoreComments } from "@/features/comments/actions/load-more-comments";
import { createdComments } from "@/features/comments/lib/created-comments-store";
import type { CommentPage, PostComment } from "@/features/comments/lib/queries";
import { mergeLatestComments } from "@/features/comments/utils/comment-page";
import { appendPage } from "@/features/posts/utils/feed";
import { usePagedList } from "@/lib/use-paged-list";
import { CommentForm } from "./comment-form";
import { CommentThread } from "./comment-thread";

const NO_COMMENTS: PostComment[] = [];

// Below a post on its own page: one card with the reply form on top
// (always shown), then the post's comments with their whole threads,
// oldest first, with more loaded on request. The viewer's new comments show
// up at the end right away, from any reply form. Replies to a comment or
// reply are written in a popup (see ReplyPopupButton).
export function PostComments({
    postId,
    firstPage,
}: {
    postId: string;
    firstPage: CommentPage;
}) {
    const { page, loadMore, isPending, error } = usePagedList({
        firstPage,
        merge: mergeLatestComments,
        load: (cursor) => loadMoreComments(postId, cursor),
        append: (current, next) => ({
            ...appendPage(current, next),
            replies: [...current.replies, ...next.replies],
        }),
        errorMessage: "Couldn't load more replies. Please try again.",
    });

    // The loaded comments (oldest first), then the new ones from this tab
    // that no loaded page has yet, oldest first too: they're the newest, so
    // they go at the end
    const created = createdComments.useValue(`post:${postId}`, NO_COMMENTS);
    const loadedIds = new Set(page.items.map((comment) => comment.id));
    const comments = [
        ...page.items,
        ...created.filter((comment) => !loadedIds.has(comment.id)).reverse(),
    ];

    // The loaded replies by their thread's top-level comment, oldest first
    const repliesByRoot = new Map<string, PostComment[]>();
    for (const reply of page.replies) {
        const rootId = reply.rootId!;
        repliesByRoot.set(rootId, [
            ...(repliesByRoot.get(rootId) ?? []),
            reply,
        ]);
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
                <div className="border-b border-separator p-4 last:border-b-0">
                    <CommentForm postId={postId} />
                </div>
                {comments.length > 0 && (
                    <ul className="divide-y divide-separator">
                        {comments.map((comment) => (
                            <li key={comment.id}>
                                <CommentThread
                                    postId={postId}
                                    comment={comment}
                                    replies={
                                        repliesByRoot.get(comment.id) ??
                                        NO_COMMENTS
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
            <LoadMoreOrEnd
                hasMore={page.nextCursor !== null}
                hasItems={comments.length > 0}
                itemsLabel="replies"
                isPending={isPending}
                onPress={loadMore}
                error={error}
                loadingLabel="Loading more replies"
            />
        </section>
    );
}
