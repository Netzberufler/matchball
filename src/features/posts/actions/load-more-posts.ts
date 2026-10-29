"use server";

import { z } from "zod";
import { requireSession } from "@/features/auth/lib/session";
import { getFeedPage } from "@/features/posts/lib/queries";
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
]) satisfies z.ZodType<Feed>;

// The page after `cursor`. Checks its arguments: actions can be called
// with anything, not just what the feed component sends.
export async function loadMorePosts(feedInput: unknown, cursorInput: unknown) {
    const { user } = await requireSession();

    const feed = parseActionInput(feedSchema, feedInput);
    const cursor = parseActionInput(feedCursorSchema, cursorInput);
    return getFeedPage(feed, user.id, cursor);
}
