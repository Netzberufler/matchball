"use client";

import { useSyncExternalStore } from "react";

export type LikeState = { isLiked: boolean; likeCount: number };

// Like states the viewer changed in this tab, by post id. They win over the
// server data a page was rendered with, so a post shows the same state
// everywhere, e.g. on the feed after liking it on its own page.
const changedStates = new Map<string, LikeState>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function useLikeState(postId: string, fromServer: LikeState) {
    const changed = useSyncExternalStore(
        subscribe,
        () => changedStates.get(postId),
        () => undefined,
    );
    return changed ?? fromServer;
}

export function setLikeState(postId: string, state: LikeState) {
    changedStates.set(postId, state);
    for (const listener of listeners) {
        listener();
    }
}
