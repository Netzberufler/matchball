"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Card, EmptyState, Skeleton } from "@heroui/react";
import { LoadMore } from "@/components/ui/load-more";
import { UserAvatar } from "@/components/ui/user-avatar";
import { loadConversations } from "@/features/messages/actions/load-conversations";
import type { ConversationListItem } from "@/features/messages/lib/queries";
import { conversationPath } from "@/features/messages/utils/messages-path";
import { appendPage, type FeedPage } from "@/features/posts/utils/feed";
import { useFeedPage } from "@/features/posts/utils/use-feed-page";
import {
    formatFullPostDate,
    formatPostDate,
} from "@/features/posts/utils/format-post-date";

// The count of unread messages, like the counts in the nav
const countClassName =
    "flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold tabular-nums text-accent-foreground";

// The signed-in user's conversations, each showing whom it's with and
// linking to it, with more loaded on request. Next.js keeps the page
// mounted but hidden while a conversation is open, and Back shows it again
// as it was, so the list loads the latest conversations whenever it's
// shown again: one just started, new messages and what's been read since.
export function ConversationList({
    firstPage,
}: {
    firstPage: FeedPage<ConversationListItem>;
}) {
    const [page, setPage] = useFeedPage(firstPage, startOver);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    // Shown before, so showing it now is coming back to it
    const wasShown = useRef(false);

    // Effects run again when a hidden page is shown again
    useEffect(() => {
        if (!wasShown.current) {
            wasShown.current = true;
            return;
        }
        let isCurrent = true;
        loadConversations(null).then(
            (latest) => {
                // Starts over from the latest: conversations move to the
                // top when they get new messages
                if (isCurrent) {
                    setPage(latest);
                }
            },
            // Keep what's shown; the next visit tries again
            () => {},
        );
        return () => {
            isCurrent = false;
        };
    }, [setPage]);

    function loadMore() {
        const cursor = page.nextCursor;
        if (!cursor) {
            return;
        }
        setError(null);
        startTransition(async () => {
            try {
                const nextPage = await loadConversations(cursor);
                setPage((current) => appendPage(current, nextPage));
            } catch {
                setError("Couldn't load more conversations. Please try again.");
            }
        });
    }

    if (page.items.length === 0) {
        return (
            <Card>
                <EmptyState className="text-center">
                    No conversations yet. Start one with New chat.
                </EmptyState>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <Card className="gap-0 overflow-hidden p-0">
                <ul className="divide-y divide-separator">
                    {page.items.map(
                        ({ id, partner, lastMessageAt, unreadCount }) => (
                            <li key={id}>
                                <Link
                                    href={conversationPath(partner.username)}
                                    // Same hover colour as posts in the feeds
                                    className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-secondary/60"
                                >
                                    <UserAvatar
                                        name={partner.name}
                                        image={partner.image}
                                    />
                                    <span className="flex min-w-0 flex-1 flex-col">
                                        <span className="truncate font-semibold text-foreground">
                                            {partner.name}
                                        </span>
                                        {/* Spaces the link text for screen
                                        readers */}{" "}
                                        <span className="truncate text-sm text-muted">
                                            @{partner.username}
                                        </span>
                                    </span>
                                    <span className="flex shrink-0 flex-col items-end gap-1">
                                        <time
                                            dateTime={lastMessageAt.toISOString()}
                                            title={formatFullPostDate(
                                                lastMessageAt,
                                            )}
                                            className="text-sm text-muted"
                                            suppressHydrationWarning
                                        >
                                            {formatPostDate(lastMessageAt)}
                                        </time>
                                        {unreadCount > 0 && (
                                            <span className={countClassName}>
                                                {unreadCount > 99
                                                    ? "99+"
                                                    : unreadCount}
                                                <span className="sr-only">
                                                    {" "}
                                                    unread
                                                </span>
                                            </span>
                                        )}
                                    </span>
                                </Link>
                            </li>
                        ),
                    )}
                </ul>
            </Card>
            {page.nextCursor && (
                <LoadMore
                    isPending={isPending}
                    onPress={loadMore}
                    error={error}
                    loadingLabel="Loading more conversations"
                />
            )}
        </div>
    );
}

// Shown while the conversations load; the shape of their rows
export function ConversationListFallback() {
    return (
        <Card className="gap-0 p-0" aria-hidden>
            <ul className="divide-y divide-separator">
                {[0, 1, 2].map((index) => (
                    <li key={index} className="flex items-center gap-3 p-4">
                        <Skeleton className="size-10 shrink-0 rounded-full" />
                        <div className="flex flex-1 flex-col gap-2">
                            <Skeleton className="h-3.5 w-36 rounded-full" />
                            <Skeleton className="h-3 w-24 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-8 rounded-full" />
                    </li>
                ))}
            </ul>
        </Card>
    );
}

// A refreshed page's conversations replace the shown ones, like the latest
// ones when the list is shown again: their order changes with new messages
function startOver<Page>(_current: Page, latest: Page) {
    return latest;
}
