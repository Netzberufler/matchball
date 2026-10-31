"use client";

import { useEffect, useEffectEvent, useState, useTransition } from "react";
import {
    initialEntries,
    type OnDemandEntries,
    refreshEntries,
} from "@/lib/on-demand";

const NOTHING = {};

function replace<Data>(_current: Data, latest: Data) {
    return latest;
}

// Data a part of the page loads when it's first needed, by key, e.g. the
// matches of a profile tab when it's opened. `open(key)` loads it unless
// it's loaded already, so it stays while switching back and forth; if
// loading fails, `failed(key)` is true until `open(key)` tries again.
// `initial` is what the server sent with the page.
//
// A new `refreshKey` (any value the server renders anew, e.g. `initial`)
// means the page was refreshed: `initial` is put into what's shown with
// `merge`, and everything else loaded is old. The shown key's old data is
// loaded again right away, and the others' when they're opened; the old
// data stays shown until then. Noticed while rendering, as React
// recommends for state that follows props.
export function useOnDemand<Key extends string, Data>({
    load,
    shownKey,
    refreshKey,
    initial = NOTHING,
    merge = replace,
}: {
    load: (key: Key) => Promise<Data>;
    // The key shown now, or null
    shownKey: Key | null;
    refreshKey: unknown;
    initial?: Partial<Record<Key, Data>>;
    merge?: (current: Data, latest: Data) => Data;
}) {
    const [entries, setEntries] = useState<OnDemandEntries<Key, Data>>(() =>
        initialEntries(initial),
    );
    const [shownRefreshKey, setShownRefreshKey] = useState(refreshKey);
    if (refreshKey !== shownRefreshKey) {
        setShownRefreshKey(refreshKey);
        setEntries(refreshEntries(entries, initial, merge));
    }
    const [, startTransition] = useTransition();

    function setData(key: Key, data: Data) {
        setEntries((current) => ({
            ...current,
            [key]: { data, isOld: false, failed: false },
        }));
    }

    function open(key: Key) {
        const entry = entries[key];
        if (entry?.data != null && !entry.isOld) {
            return;
        }
        setEntries((current) => ({
            ...current,
            [key]: { data: entry?.data ?? null, isOld: false, failed: false },
        }));
        startTransition(async () => {
            try {
                setData(key, await load(key));
            } catch {
                setEntries((current) => ({
                    ...current,
                    [key]: {
                        data: current[key]?.data ?? null,
                        isOld: false,
                        failed: true,
                    },
                }));
            }
        });
    }

    // The old data being shown is loaded again; it stays if that fails
    const reload = useEffectEvent((key: Key, isCurrent: () => boolean) => {
        load(key).then(
            (data) => isCurrent() && setData(key, data),
            () => {},
        );
    });
    const isShownOld = shownKey !== null && entries[shownKey]?.isOld === true;
    useEffect(() => {
        if (!isShownOld || shownKey === null) {
            return;
        }
        let isCurrent = true;
        reload(shownKey, () => isCurrent);
        return () => {
            isCurrent = false;
        };
    }, [isShownOld, shownKey]);

    return {
        data: (key: Key) => entries[key]?.data ?? null,
        failed: (key: Key) => entries[key]?.failed === true,
        open,
        // Changes the loaded data, e.g. to add the next page of a list
        update(key: Key, change: (data: Data) => Data) {
            setEntries((current) => {
                const entry = current[key];
                return entry?.data == null
                    ? current
                    : {
                          ...current,
                          [key]: { ...entry, data: change(entry.data) },
                      };
            });
        },
    };
}
