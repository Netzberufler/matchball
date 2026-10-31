"use client";

import { useState } from "react";
import { getUnreadMessageCount } from "@/features/messages/actions/count-unread-messages";
import { usePolling } from "@/lib/use-polling";

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

    usePolling(async () => {
        const value = await getUnreadMessageCount();
        setCount((current) => ({ ...current, value }));
    }, POLL_INTERVAL_MS);

    return count.value;
}
