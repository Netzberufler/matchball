"use server";

import { z } from "zod";
import { requireSession } from "@/features/auth/lib/session";
import { getChallengesPage } from "@/features/challenges/lib/queries";
import { CHALLENGE_STATUS_KEYS } from "@/features/challenges/utils/challenge-filters";
import { getRecentlyFollowed } from "@/features/follows/lib/queries";
import type { PublicUser } from "@/features/profile/utils/public-user";
import {
    feedCursorSchema,
    idSchema,
    parseActionInput,
} from "@/lib/action-input";

// The filters above the table, rebuilt from their two fields. The lists are
// limited, as each entry adds to the query.
const filtersSchema = z.object({
    statuses: z
        .array(z.enum(CHALLENGE_STATUS_KEYS))
        .max(CHALLENGE_STATUS_KEYS.length),
    opponentIds: z.array(idSchema).max(100),
});

// A page of the signed-in user's challenges that `filtersInput` show: the
// first one without a cursor (when the filters change), or the one after
// `cursor`, for "Load more". Checks its arguments: actions can be called
// with anything.
export async function loadChallenges(
    filtersInput: unknown,
    cursorInput: unknown,
) {
    const { user } = await requireSession();
    const filters = parseActionInput(filtersSchema, filtersInput);
    const cursor = parseActionInput(feedCursorSchema.nullable(), cursorInput);
    return getChallengesPage(user.id, filters, cursor ?? undefined);
}

// People the signed-in user follows, suggested when the Challenge popup
// opens
export async function loadChallengeSuggestions(): Promise<PublicUser[]> {
    const { user } = await requireSession();
    return getRecentlyFollowed(user.id);
}
