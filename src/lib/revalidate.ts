import "server-only";

import { revalidatePath } from "next/cache";

// After a change the viewer should see everywhere, e.g. their name, a post
// or a match. Renders the current page again, and makes the browser load
// every other page fresh when it's shown again, including the ones Next.js
// keeps hidden and the ones Back returns to. Names, photos, posts and
// matches show up on many pages, so this refreshes all of them instead of a
// list of paths that's easy to get wrong. Only works in server actions.
export function revalidateAllPages() {
    revalidatePath("/", "layout");
}
