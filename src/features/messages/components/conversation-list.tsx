"use client";

import Link from "next/link";
import { Skeleton } from "@heroui/react";
import { EmptyCard, ListCard } from "@/components/ui/list-card";
import { LoadMore } from "@/components/ui/load-more";
import { RelativeTime } from "@/components/ui/relative-time";
import { UserIdentity } from "@/components/ui/user-identity";
import { loadConversations } from "@/features/messages/actions/load-conversations";
import type { ConversationListItem } from "@/features/messages/lib/queries";
import { conversationPath } from "@/features/messages/utils/messages-path";
import type { FeedPage } from "@/features/posts/utils/feed";
import { usePagedList } from "@/lib/use-paged-list";
import { useOnShownAgain } from "@/lib/use-polling";

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
    const { page, setPage, loadMore, isPending, error } = usePagedList({
        firstPage,
        merge: startOver,
        load: loadConversations,
        errorMessage: "Couldn't load more conversations. Please try again.",
    });

    useOnShownAgain(() => {
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
    });

    if (page.items.length === 0) {
        return (
            <EmptyCard>
                No conversations yet. Start one with New chat.
            </EmptyCard>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <ListCard>
                {page.items.map(
                    ({ id, partner, lastMessageAt, unreadCount }) => (
                        <li key={id}>
                            <Link
                                href={conversationPath(partner.username)}
                                // Same hover colour as posts in the feeds
                                className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-secondary/60"
                            >
                                <UserIdentity
                                    user={partner}
                                    className="flex-1"
                                />
                                <span className="flex shrink-0 flex-col items-end gap-1">
                                    <RelativeTime
                                        date={lastMessageAt}
                                        className="text-sm text-muted"
                                    />
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
            </ListCard>
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
        <ListCard aria-hidden>
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
        </ListCard>
    );
}

// A refreshed page's conversations replace the shown ones, like the latest
// ones when the list is shown again: their order changes with new messages
function startOver<Page>(_current: Page, latest: Page) {
    return latest;
}
