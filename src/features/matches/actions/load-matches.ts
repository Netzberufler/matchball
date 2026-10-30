"use server";

import { requireSession } from "@/features/auth/lib/session";
import { getMatchesPage } from "@/features/matches/lib/queries";
import {
    idSchema,
    matchCursorSchema,
    parseActionInput,
} from "@/lib/action-input";

// A page of a player's confirmed matches, for their profile: the first one
// without a cursor (when the tab opens), or the one after `cursor`. Anyone
// signed in can see them, as with the match pages. Checks its arguments:
// actions can be called with anything, not just what the list sends.
export async function loadMatches(userIdInput: unknown, cursorInput: unknown) {
    await requireSession();

    const userId = parseActionInput(idSchema, userIdInput);
    const cursor = parseActionInput(matchCursorSchema.nullable(), cursorInput);
    return getMatchesPage(userId, cursor ?? undefined);
}
