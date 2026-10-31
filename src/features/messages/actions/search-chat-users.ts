"use server";

import { requireSession } from "@/features/auth/lib/session";
import { getChatSuggestions } from "@/features/messages/lib/queries";
import type { PublicUser } from "@/features/profile/utils/public-user";
import { findUsersByNameOrUsername } from "@/features/search/lib/find-users";

// Users to start a chat with in the New chat popup, by username or name.
// Never the signed-in user.
export async function searchChatUsers(query: unknown): Promise<PublicUser[]> {
    const { user } = await requireSession();
    // Checked there: actions can be called with anything
    return findUsersByNameOrUsername(query, user.id);
}

// People the signed-in user follows, suggested when the popup opens
export async function loadChatSuggestions(): Promise<PublicUser[]> {
    const { user } = await requireSession();
    return getChatSuggestions(user.id);
}
