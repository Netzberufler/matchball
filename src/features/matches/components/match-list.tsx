"use client";

import { useState, useTransition } from "react";
import { LoadMore } from "@/components/ui/load-more";
import { loadMatches } from "@/features/matches/actions/load-matches";
import type { MatchCursor, UserMatch } from "@/features/matches/lib/queries";
import { appendPage, type FeedPage } from "@/features/posts/utils/feed";
import { MatchTable } from "./match-table";

type Page = FeedPage<UserMatch, MatchCursor>;

// A player's confirmed matches, newest first, with more loaded on request.
// The profile tabs keep `page`, so it stays when switching tabs.
export function MatchList({
    userId,
    page,
    onPageChange,
    label,
    emptyMessage,
}: {
    userId: string;
    page: Page;
    onPageChange: (update: (current: Page) => Page) => void;
    label: string;
    emptyMessage: string;
}) {
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
                const nextPage = await loadMatches(userId, cursor);
                onPageChange((current) => appendPage(current, nextPage));
            } catch {
                setError("Couldn't load more matches. Please try again.");
            }
        });
    }

    return (
        <div className="flex flex-col gap-4">
            <MatchTable
                matches={page.items}
                label={label}
                emptyMessage={emptyMessage}
            />

            {page.nextCursor ? (
                <LoadMore
                    isPending={isPending}
                    onPress={loadMore}
                    error={error}
                    loadingLabel="Loading more matches"
                />
            ) : (
                page.items.length > 0 && (
                    <p className="text-center text-sm text-muted">
                        You&apos;ve reached the end. No more matches to show.
                    </p>
                )
            )}
        </div>
    );
}
