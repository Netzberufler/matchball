"use client";

import { Button, Spinner } from "@heroui/react";

// The "Load more" button below a paged list. While loading, a spinner takes
// its place; `error` shows below it.
export function LoadMore({
    isPending,
    onPress,
    error,
    loadingLabel,
}: {
    isPending: boolean;
    onPress: () => void;
    error: string | null;
    // For screen readers, e.g. "Loading more posts"
    loadingLabel: string;
}) {
    return (
        <div className="flex flex-col items-center gap-2">
            {/* Same height as the button, so nothing jumps */}
            <div className="flex h-10 items-center md:h-9">
                {isPending ? (
                    <Spinner role="status" aria-label={loadingLabel} />
                ) : (
                    <Button variant="tertiary" onPress={onPress}>
                        Load more
                    </Button>
                )}
            </div>
            {error && (
                <p className="text-sm text-danger" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

// Below a list that loads more pages: the "Load more" button while there
// are more (see LoadMore), then a note that the list ends, e.g. "posts",
// unless nothing is shown
export function LoadMoreOrEnd({
    hasMore,
    hasItems,
    itemsLabel,
    ...loadMore
}: React.ComponentProps<typeof LoadMore> & {
    hasMore: boolean;
    hasItems: boolean;
    // What's listed, e.g. "posts"
    itemsLabel: string;
}) {
    if (hasMore) {
        return <LoadMore {...loadMore} />;
    }
    if (!hasItems) {
        return null;
    }
    return (
        <p className="text-center text-sm text-muted">
            You&apos;ve reached the end. No more {itemsLabel} to show.
        </p>
    );
}
