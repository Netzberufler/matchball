"use server";

import { requireSession } from "@/features/auth/lib/session";
import { getChallengesPage } from "@/features/challenges/lib/queries";
import { getRecentlyFollowed } from "@/features/follows/lib/queries";
import type { PublicUser } from "@/features/profile/utils/public-user";
import { feedCursorSchema, parseActionInput } from "@/lib/action-input";

// The next page of the signed-in user's challenges, for "Load more".
// Checks its argument: actions can be called with anything.
export async function loadMoreChallenges(cursorInput: unknown) {
    const { user } = await requireSession();
    const cursor = parseActionInput(feedCursorSchema, cursorInput);
    return getChallengesPage(user.id, cursor);
}

// People the signed-in user follows, suggested when the Challenge popup
// opens
export async function loadChallengeSuggestions(): Promise<PublicUser[]> {
    const { user } = await requireSession();
    return getRecentlyFollowed(user.id);
}
