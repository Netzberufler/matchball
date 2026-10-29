"use server";

import { requireSession } from "@/features/auth/lib/session";
import { getCommentPage } from "@/features/comments/lib/queries";
import {
    feedCursorSchema,
    idSchema,
    parseActionInput,
} from "@/lib/action-input";

// The page of a post's comments after `cursor`. Checks its arguments:
// actions can be called with anything, not just what the list sends.
export async function loadMoreComments(
    postIdInput: unknown,
    cursorInput: unknown,
) {
    const { user } = await requireSession();

    const postId = parseActionInput(idSchema, postIdInput);
    const cursor = parseActionInput(feedCursorSchema, cursorInput);
    return getCommentPage(postId, user.id, cursor);
}
