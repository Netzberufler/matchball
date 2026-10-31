// The data of useOnDemand (see use-on-demand.ts), by key, e.g. by tab

export type OnDemandEntry<Data> = {
    // null until loaded, and if it couldn't be
    data: Data | null;
    // From before the page was refreshed, so it's loaded again
    isOld: boolean;
    // The last load failed
    failed: boolean;
};

export type OnDemandEntries<Key extends string, Data> = Partial<
    Record<Key, OnDemandEntry<Data>>
>;

// What the server sent with the page, as loaded entries
export function initialEntries<Key extends string, Data>(
    initial: Partial<Record<Key, Data>>,
): OnDemandEntries<Key, Data> {
    const entries: OnDemandEntries<Key, Data> = {};
    for (const key of Object.keys(initial) as Key[]) {
        entries[key] = { data: initial[key]!, isOld: false, failed: false };
    }
    return entries;
}

// After the page was refreshed: what the server sent again is merged into
// what's shown (or shown as it is), and everything else is old
export function refreshEntries<Key extends string, Data>(
    current: OnDemandEntries<Key, Data>,
    initial: Partial<Record<Key, Data>>,
    merge: (current: Data, latest: Data) => Data,
): OnDemandEntries<Key, Data> {
    const entries: OnDemandEntries<Key, Data> = {};
    for (const key of Object.keys(current) as Key[]) {
        const entry = current[key]!;
        entries[key] = entry.data === null ? entry : { ...entry, isOld: true };
    }
    for (const key of Object.keys(initial) as Key[]) {
        const shown = current[key]?.data;
        const latest = initial[key]!;
        entries[key] = {
            data: shown == null ? latest : merge(shown, latest),
            isOld: false,
            failed: false,
        };
    }
    return entries;
}
