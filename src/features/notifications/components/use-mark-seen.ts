"use client";

import { useCallback, useEffect, useRef } from "react";
import { markNotificationsSeen } from "@/features/notifications/actions/mark-notifications-seen";

// How long to collect the notifications that scroll into view before
// marking them seen in one request
const BATCH_DELAY_MS = 1000;

// Marks notifications seen once at least half of one has been in the
// viewport. Returns a ref callback for the element of a new notification,
// which carries its id in data-notification-id. What's still waiting is
// sent when the list goes away, e.g. when leaving the page.
export function useMarkSeen() {
    const observerRef = useRef<IntersectionObserver | null>(null);
    // Seen, and sent or about to be, so each is sent once
    const seenRef = useRef(new Set<string>());
    const queueRef = useRef(new Set<string>());
    const timerRef = useRef<number | null>(null);

    const flush = useCallback(() => {
        timerRef.current = null;
        const ids = [...queueRef.current];
        queueRef.current.clear();
        if (ids.length === 0) {
            return;
        }
        markNotificationsSeen(ids).catch(() => {
            // Tried again when they scroll into view next time
            for (const id of ids) {
                seenRef.current.delete(id);
            }
        });
    }, []);

    const getObserver = useCallback(() => {
        observerRef.current ??= new IntersectionObserver(
            (entries, observer) => {
                for (const entry of entries) {
                    const id = (entry.target as HTMLElement).dataset
                        .notificationId;
                    if (!entry.isIntersecting || !id) {
                        continue;
                    }
                    observer.unobserve(entry.target);
                    if (seenRef.current.has(id)) {
                        continue;
                    }
                    seenRef.current.add(id);
                    queueRef.current.add(id);
                    timerRef.current ??= window.setTimeout(
                        flush,
                        BATCH_DELAY_MS,
                    );
                }
            },
            { threshold: 0.5 },
        );
        return observerRef.current;
    }, [flush]);

    useEffect(
        () => () => {
            observerRef.current?.disconnect();
            observerRef.current = null;
            if (timerRef.current !== null) {
                window.clearTimeout(timerRef.current);
            }
            flush();
        },
        [flush],
    );

    return useCallback(
        (element: HTMLElement | null) => {
            if (!element) {
                return;
            }
            const observer = getObserver();
            observer.observe(element);
            return () => observer.unobserve(element);
        },
        [getObserver],
    );
}
