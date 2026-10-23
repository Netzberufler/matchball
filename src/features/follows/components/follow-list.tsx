"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card, EmptyState, Skeleton } from "@heroui/react";
import { LoadMore } from "@/components/ui/load-more";
import { UserAvatar } from "@/components/ui/user-avatar";
import { loadMoreFollows } from "@/features/follows/actions/load-more-follows";
import type { FollowListUser } from "@/features/follows/lib/queries";
import type { FollowListKind } from "@/features/follows/utils/follow-list";
import { appendPage, type FeedPage } from "@/features/posts/utils/feed";
import { profilePath } from "@/features/profile/utils/profile-path";

// A user's followers, or whom they follow, newest first, with more loaded
// on request. Each person links to their profile.
export function FollowList({
    kind,
    userId,
    firstPage,
    emptyMessage,
}: {
    kind: FollowListKind;
    userId: string;
    firstPage: FeedPage<FollowListUser>;
    emptyMessage: string;
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
                const nextPage = await loadMoreFollows(kind, userId, cursor);
                setPage((current) => appendPage(current, nextPage));
            } catch {
                setError("Couldn't load more people. Please try again.");
            }
        });
    }

    if (page.items.length === 0) {
        return (
            <Card>
                <EmptyState className="text-center">{emptyMessage}</EmptyState>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <Card className="gap-0 overflow-hidden p-0">
                <ul className="divide-y divide-separator">
                    {page.items.map((user) => (
                        <li key={user.id}>
                            <Link
                                href={profilePath(user.username)}
                                // Same hover colour as posts in the feeds
                                className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-secondary/60"
                            >
                                <UserAvatar
                                    name={user.name}
                                    image={user.image}
                                />
                                <span className="flex min-w-0 flex-col">
                                    <span className="truncate font-semibold text-foreground">
                                        {user.name}
                                    </span>
                                    {/* Spaces the link text for screen
                                        readers */}{" "}
                                    <span className="truncate text-sm text-muted">
                                        @{user.username}
                                    </span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </Card>
            {page.nextCursor && (
                <LoadMore
                    isPending={isPending}
                    onPress={loadMore}
                    error={error}
                    loadingLabel="Loading more people"
                />
            )}
        </div>
    );
}

// Shown while a follow list loads
export function FollowListFallback() {
    return (
        <Card className="gap-0 p-0" aria-hidden>
            <ul className="divide-y divide-separator">
                {[0, 1, 2].map((index) => (
                    <li key={index} className="flex items-center gap-3 p-4">
                        <Skeleton className="size-10 shrink-0 rounded-full" />
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-3.5 w-36 rounded-full" />
                            <Skeleton className="h-3 w-24 rounded-full" />
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    );
}
