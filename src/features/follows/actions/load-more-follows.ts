"use server";

import { z } from "zod";
import { requireSession } from "@/features/auth/lib/session";
import { getFollowListPage } from "@/features/follows/lib/queries";
import { FOLLOW_LIST_KINDS } from "@/features/follows/utils/follow-list";
import {
    feedCursorSchema,
    idSchema,
    parseActionInput,
} from "@/lib/action-input";

// The page of a follow list after `cursor`. Checks its arguments: actions
// can be called with anything, not just what the list sends.
export async function loadMoreFollows(
    kindInput: unknown,
    userIdInput: unknown,
    cursorInput: unknown,
) {
    await requireSession();

    const kind = parseActionInput(z.enum(FOLLOW_LIST_KINDS), kindInput);
    const userId = parseActionInput(idSchema, userIdInput);
    const cursor = parseActionInput(feedCursorSchema, cursorInput);
    return getFollowListPage(kind, userId, cursor);
}
