"use server";

import { requireSession } from "@/features/auth/lib/session";
import { getStatsMatches } from "@/features/matches/lib/queries";
import { idSchema, parseActionInput } from "@/lib/action-input";

// All of a player's confirmed matches, as the statistics on their profile
// read them. Anyone signed in can see them, as with the matches. Checks its
// argument: actions can be called with anything, not just what the tab
// sends.
export async function loadMatchStats(userIdInput: unknown) {
    await requireSession();

    const userId = parseActionInput(idSchema, userIdInput);
    return getStatsMatches(userId);
}
