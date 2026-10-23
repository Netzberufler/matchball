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
