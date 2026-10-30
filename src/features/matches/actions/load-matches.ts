"use server";

import { requireSession } from "@/features/auth/lib/session";
import { getAllMatches } from "@/features/matches/lib/queries";
import { idSchema, parseActionInput } from "@/lib/action-input";

// All of a player's confirmed matches, for their profile, which filters
// them and shows their statistics. Anyone signed in can see them, as with
// the match pages. Checks its argument: actions can be called with
// anything, not just what the profile sends.
export async function loadMatches(userIdInput: unknown) {
    await requireSession();

    const userId = parseActionInput(idSchema, userIdInput);
    return getAllMatches(userId);
}
