"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Skeleton } from "@heroui/react";
import { LoadMore } from "@/components/ui/load-more";
import { RelativeTime } from "@/components/ui/relative-time";
import {
    loadNewMessages,
    loadOlderMessages,
    markConversationRead,
} from "@/features/messages/actions/load-messages";
import { sendMessage } from "@/features/messages/actions/send-message";
import type { ChatMessage } from "@/features/messages/lib/queries";
import {
    endsGroup,
    formatMessageTime,
    mergeMessages,
} from "@/features/messages/utils/chat-thread";
import type { FeedPage } from "@/features/posts/utils/feed";
import type { PublicUser } from "@/features/profile/utils/public-user";
import { useLoadMore } from "@/lib/use-paged-list";
import { usePolling } from "@/lib/use-polling";
import { MessageForm } from "./message-form";

// How often an open conversation checks for new messages
const POLL_INTERVAL_MS = 4000;
// Closer to the bottom than this counts as reading the latest messages, so
// new ones scroll into view
const NEAR_BOTTOM_PX = 150;

// Where the page should scroll once the messages have changed
type PendingScroll = "bottom" | { fromBottom: number } | null;

function distanceFromBottom() {
    return (
        document.documentElement.scrollHeight -
        window.scrollY -
        window.innerHeight
    );
}

// The messages between the signed-in user and `partner`, oldest at the
// top, with older ones loaded on request and the form to write below them.
// The page scrolls to the latest message. While the tab is visible, it
// checks for new messages every few seconds; what it shows counts as read.
// `firstPage` is the latest messages, newest first (empty for a new
// conversation); `hasReceived` tells whether some are from `partner`,
// which may be unread.
export function ConversationView({
    partner,
    firstPage,
    hasReceived,
}: {
    partner: PublicUser;
    firstPage: FeedPage<ChatMessage>;
    hasReceived: boolean;
}) {
    const [messages, setMessages] = useState(() =>
        [...firstPage.items].reverse(),
    );
    const [olderCursor, setOlderCursor] = useState(firstPage.nextCursor);
    const pendingScroll = useRef<PendingScroll>("bottom");
    // For the checks, which run outside of rendering
    const messagesRef = useRef(messages);

    useLayoutEffect(() => {
        messagesRef.current = messages;
        const scroll = pendingScroll.current;
        pendingScroll.current = null;
        if (scroll === null) {
            return;
        }
        const { scrollHeight } = document.documentElement;
        window.scrollTo({
            top:
                scroll === "bottom"
                    ? scrollHeight
                    : scrollHeight - window.innerHeight - scroll.fromBottom,
        });
    }, [messages]);

    // Shown now, so they're read
    useEffect(() => {
        if (hasReceived) {
            markConversationRead(partner.id).catch(() => {
                // Marked read with the next new message, or the next visit
            });
        }
        // Only when the conversation opens
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    usePolling(async () => {
        const latest = messagesRef.current.at(-1);
        const newMessages = await loadNewMessages(
            partner.id,
            latest ? { createdAt: latest.createdAt, id: latest.id } : null,
        );
        if (newMessages.length > 0) {
            // Follow the conversation only if it's read at the bottom
            if (distanceFromBottom() < NEAR_BOTTOM_PX) {
                pendingScroll.current = "bottom";
            }
            setMessages((current) => mergeMessages(current, newMessages));
        }
    }, POLL_INTERVAL_MS);

    const {
        loadMore: loadOlder,
        isPending: isLoadingOlder,
        error: olderError,
    } = useLoadMore({
        cursor: olderCursor,
        load: (cursor) => loadOlderMessages(partner.id, cursor),
        onLoaded: (page) => {
            // Keep the messages in view where they are
            pendingScroll.current = { fromBottom: distanceFromBottom() };
            setMessages((current) => mergeMessages(current, page.items));
            setOlderCursor(page.nextCursor);
        },
        errorMessage: "Couldn't load older messages. Please try again.",
    });

    async function send(formData: FormData) {
        const result = await sendMessage(partner.id, formData);
        if (result.error === null) {
            pendingScroll.current = "bottom";
            setMessages((current) => mergeMessages(current, [result.message]));
        }
        return result;
    }

    return (
        <div className="flex flex-col gap-4">
            {olderCursor && (
                <LoadMore
                    isPending={isLoadingOlder}
                    onPress={loadOlder}
                    error={olderError}
                    loadingLabel="Loading older messages"
                />
            )}
            {/* A new conversation shows just the form */}
            {messages.length > 0 && (
                <ol
                    className="flex flex-col"
                    aria-label={`Messages with ${partner.name}`}
                >
                    {messages.map((message, index) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            senderName={partner.name}
                            showTime={endsGroup(message, messages[index + 1])}
                        />
                    ))}
                </ol>
            )}
            {/* Stays at the bottom of the screen, above the mobile nav
                bar, while the messages scroll */}
            <div className="sticky bottom-0 -mx-1 bg-background px-1 pt-2 pb-4 max-md:bottom-[calc(var(--mobile-nav-height)+var(--mobile-nav-offset))] max-md:pb-2">
                <MessageForm
                    // Starts empty for another conversation
                    key={partner.id}
                    recipientName={partner.name}
                    action={send}
                />
            </div>
        </div>
    );
}

function MessageBubble({
    message,
    senderName,
    showTime,
}: {
    message: ChatMessage;
    // The other user's name, for screen readers
    senderName: string;
    // Below the last message of a group
    showTime: boolean;
}) {
    const { isOwn } = message;
    return (
        <li
            className={`flex flex-col ${isOwn ? "items-end" : "items-start"} ${
                showTime ? "mb-3" : "mb-1"
            }`}
        >
            <span className="sr-only">{isOwn ? "You" : senderName}: </span>
            <p
                className={`max-w-[80%] whitespace-pre-wrap break-words rounded-3xl px-4 py-2 ${
                    isOwn
                        ? "bg-accent text-accent-foreground"
                        : "bg-surface text-foreground"
                }`}
            >
                {message.content}
            </p>
            {showTime && (
                <RelativeTime
                    date={message.createdAt}
                    format={formatMessageTime}
                    className="mt-1 px-2 text-xs text-muted"
                />
            )}
        </li>
    );
}

// Shown while the conversation loads; a few messages on either side
export function ConversationViewFallback() {
    return (
        <div className="flex flex-col gap-3" aria-hidden>
            <Skeleton className="h-10 w-2/3 self-start rounded-3xl" />
            <Skeleton className="h-10 w-1/2 self-end rounded-3xl" />
            <Skeleton className="h-10 w-3/5 self-start rounded-3xl" />
        </div>
    );
}
