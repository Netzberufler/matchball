"use server";

import { z } from "zod";
import { requireSession } from "@/features/auth/lib/session";
import { getFeedPage } from "@/features/posts/lib/queries";
import { searchQuerySchema } from "@/features/search/utils/search-query";
import type { Feed } from "@/features/posts/utils/feed";
import {
    feedCursorSchema,
    idSchema,
    parseActionInput,
} from "@/lib/action-input";

// A Feed (see utils/feed.ts)
const feedSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("home") }),
    z.object({ type: z.literal("user"), authorId: idSchema }),
    z.object({ type: z.literal("search"), query: searchQuerySchema }),
    z.object({ type: z.literal("popular") }),
]) satisfies z.ZodType<Feed>;

// A PostCursor (see utils/feed.ts)
const postCursorSchema = feedCursorSchema.extend({
    likeCount: z.number().int().nonnegative(),
});

// The page after `cursor`. Checks its arguments: actions can be called
// with anything, not just what the feed component sends.
export async function loadMorePosts(feedInput: unknown, cursorInput: unknown) {
    const { user } = await requireSession();

    const feed = parseActionInput(feedSchema, feedInput);
    const cursor = parseActionInput(postCursorSchema, cursorInput);
    return getFeedPage(feed, user.id, cursor);
}
