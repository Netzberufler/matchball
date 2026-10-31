"use server";

import { z } from "zod";
import { requireSession } from "@/features/auth/lib/session";
import { USERNAME_MAX_LENGTH } from "@/features/auth/utils/auth-rules";
import {
    CANDIDATES_COUNT,
    MAX_RESULTS,
    nameOrUsernameWhere,
} from "@/features/search/lib/find-users";
import { prisma } from "@/prisma/db";
import {
    type PublicUser,
    publicUserSelect,
} from "@/features/profile/utils/public-user";

// What follows the @: only username characters, so it's also safe to use
// in a LIKE pattern
const mentionQuerySchema = z
    .string()
    .regex(new RegExp(`^[a-z0-9_]{1,${USERNAME_MAX_LENGTH}}$`));

// Users to suggest for "@query" in the mention autocomplete. Usernames
// starting with the query (on their unique index), and from a few
// characters on, names with a word starting with it (on the trigram
// index). Exact username first, then other usernames, then names.
export async function searchMentionUsers(
    input: unknown,
): Promise<PublicUser[]> {
    await requireSession();

    // Checked here: actions can be called with anything
    const parsed = mentionQuerySchema.safeParse(input);
    if (!parsed.success) {
        return [];
    }
    const query = parsed.data;

    const users = await prisma.user.findMany({
        where: nameOrUsernameWhere(query, query),
        select: publicUserSelect,
        orderBy: { username: "asc" },
        take: CANDIDATES_COUNT,
    });

    const rank = (user: PublicUser) =>
        user.username === query ? 0 : user.username.startsWith(query) ? 1 : 2;
    return users.sort((a, b) => rank(a) - rank(b)).slice(0, MAX_RESULTS);
}
