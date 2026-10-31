"use server";

import { requireSession } from "@/features/auth/lib/session";
import type { PublicUser } from "@/features/profile/utils/public-user";
import { findUsersByNameOrUsername } from "@/features/search/lib/find-users";

// Users to suggest as the opponent in the add match form, by username or
// name. Never the signed-in user, who can't play themselves.
export async function searchOpponents(query: unknown): Promise<PublicUser[]> {
    const { user } = await requireSession();
    // Checked there: actions can be called with anything
    return findUsersByNameOrUsername(query, user.id);
}
