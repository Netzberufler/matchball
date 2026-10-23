"use client";

import { useSyncExternalStore } from "react";

// Values the user changed in this tab, by key (e.g. a post id), that win
// over the server data a page was rendered with. So the same post shows the
// same like state or comment count on every page, without a reload.
export function createKeyedStore<T>() {
    const values = new Map<string, T>();
    const listeners = new Set<() => void>();

    function subscribe(listener: () => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    // The changed value, or `fromServer` if there is none
    function useValue(key: string, fromServer: T): T {
        const changed = useSyncExternalStore(
            subscribe,
            () => values.get(key),
            () => undefined,
        );
        return changed ?? fromServer;
    }

    function set(key: string, value: T) {
        values.set(key, value);
        for (const listener of listeners) {
            listener();
        }
    }

    return { useValue, set };
}
