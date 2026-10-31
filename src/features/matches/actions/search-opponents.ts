"use server";

import { requireSession } from "@/features/auth/lib/session";
import {
    findUsersByNameOrUsername,
    type FoundUser,
} from "@/features/search/lib/find-users";

export type Opponent = FoundUser;

// Users to suggest as the opponent in the add match form, by username or
// name. Never the signed-in user, who can't play themselves.
export async function searchOpponents(query: unknown): Promise<Opponent[]> {
    const { user } = await requireSession();
    // Checked there: actions can be called with anything
    return findUsersByNameOrUsername(query, user.id);
}
