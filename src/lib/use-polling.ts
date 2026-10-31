"use client";

import { useEffect, useEffectEvent, useRef } from "react";

// Runs `check` every `intervalMs` while the browser tab is visible, and
// right away when the user comes back to the tab, so what arrived meanwhile
// shows up without a reload. A check doesn't start while the last one is
// still running. A failed check is tried again with the next one.
export function usePolling(check: () => Promise<unknown>, intervalMs: number) {
    const onCheck = useEffectEvent(check);

    useEffect(() => {
        let isChecking = false;

        async function run() {
            if (isChecking || document.visibilityState !== "visible") {
                return;
            }
            isChecking = true;
            try {
                await onCheck();
            } catch {
                // Tried again with the next check
            } finally {
                isChecking = false;
            }
        }

        const interval = window.setInterval(run, intervalMs);
        document.addEventListener("visibilitychange", run);
        return () => {
            window.clearInterval(interval);
            document.removeEventListener("visibilitychange", run);
        };
    }, [intervalMs]);
}

// Runs `onShown` when Next.js shows a page again that it kept hidden, e.g.
// after going Back to it, but not when the page is first shown: its data is
// as it was when the user left. `onShown` may return a cleanup, which runs
// when the page is hidden again.
export function useOnShownAgain(onShown: () => void | (() => void)) {
    const run = useEffectEvent(onShown);
    // Shown before, so showing it now is coming back to it
    const wasShown = useRef(false);

    // Effects run again when a hidden page is shown again
    useEffect(() => {
        if (!wasShown.current) {
            wasShown.current = true;
            return;
        }
        return run();
    }, []);
}
