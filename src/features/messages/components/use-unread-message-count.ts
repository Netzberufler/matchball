"use client";

import { useEffect, useState } from "react";
import { getUnreadMessageCount } from "@/features/messages/actions/count-unread-messages";

// How often the nav checks for new messages
const POLL_INTERVAL_MS = 30_000;

// The count of unread messages for the nav: `fromServer` (the count the
// page was rendered with, which reading a conversation refreshes), and
// while the tab is visible, checked again every so often, so new messages
// show up without a reload
export function useUnreadMessageCount(fromServer: number) {
    const [count, setCount] = useState({ fromServer, value: fromServer });

    // A refreshed page brings a newer count. Done while rendering, as React
    // recommends for state that follows props.
    if (count.fromServer !== fromServer) {
        setCount({ fromServer, value: fromServer });
    }

    useEffect(() => {
        function check() {
            if (document.visibilityState !== "visible") {
                return;
            }
            getUnreadMessageCount().then(
                (value) => setCount((current) => ({ ...current, value })),
                // Tried again with the next check
                () => {},
            );
        }
        const interval = window.setInterval(check, POLL_INTERVAL_MS);
        // Coming back to the tab shows what arrived meanwhile
        document.addEventListener("visibilitychange", check);
        return () => {
            window.clearInterval(interval);
            document.removeEventListener("visibilitychange", check);
        };
    }, []);

    return count.value;
}
