<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Data and state

Pages get their data in Server Components. Client components only load more, check again, search as you type and show changes right away. Next.js keeps visited pages mounted but hidden (React `<Activity>`), so client state outlives navigations.

- **After a write**, a server action calls `revalidateAllPages()` (`src/lib/revalidate.ts`), unless the change is kept in a keyed store (see below).
- **Never seed `useState` from a server prop**, except for form drafts. Use the hooks in `src/lib/`, which follow new server data:
    - `usePagedList` / `useLoadMore` (`use-paged-list.ts`): lists with "Load more"
    - `usePolling` / `useOnShownAgain` (`use-polling.ts`): checking again while the tab is visible, or when a hidden page is shown again
    - `useDebouncedSearch` (`use-debounced-search.ts`): search as you type
    - `useOnDemand` (`use-on-demand.ts`): data loaded when it's first needed, e.g. a tab's
    - For a single value, follow the prop while rendering: keep `{ fromServer, value }` in state and reset it when the prop changes (see `use-unread-message-count.ts`).
- **Messages shown after a submit** (saved, failed) are cleared in a `useLayoutEffect` cleanup, which runs when the page is hidden.
- **Showing a change right away**:
    - State shown in one place, e.g. the follow button: `useOptimistic` on the server prop, and the action calls `revalidateAllPages()`.
    - State of an item shown in many places at once, including pages loaded with "Load more", which a refresh doesn't reach, e.g. likes and comment counts: a keyed store (`src/lib/keyed-store.ts`).
- **Reads from the browser** are server actions in the feature's `actions/` folder that check the session and their arguments.
