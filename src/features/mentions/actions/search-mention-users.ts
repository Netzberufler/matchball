"use server";

import { requireSession } from "@/features/auth/lib/session";
import { USERNAME_MAX_LENGTH } from "@/features/auth/utils/auth-rules";
import { prisma } from "@/prisma/db";

// Shown in the dropdown at most
const MAX_RESULTS = 6;
// Names are searched from this many characters on: shorter patterns can't
// use the trigram index on User.name
const NAME_SEARCH_MIN_LENGTH = 3;

export type MentionUser = {
    id: string;
    username: string;
    name: string;
    image: string | null;
};

// Users to suggest for "@query" in the mention autocomplete. Usernames
// starting with the query (on their unique index), and from a few
// characters on, names with a word starting with it (on the trigram
// index). Exact username first, then other usernames, then names.
export async function searchMentionUsers(
    query: unknown,
): Promise<MentionUser[]> {
    await requireSession();

    // Checked here: actions can be called with anything. The query is what
    // follows the @, which can only be username characters.
    if (
        typeof query !== "string" ||
        !new RegExp(`^[a-z0-9_]{1,${USERNAME_MAX_LENGTH}}$`).test(query)
    ) {
        return [];
    }

    const users = await prisma.user.findMany({
        where: {
            OR: [
                { username: { startsWith: query } },
                ...(query.length >= NAME_SEARCH_MIN_LENGTH
                    ? [
                          {
                              name: {
                                  startsWith: query,
                                  mode: "insensitive" as const,
                              },
                          },
                          {
                              name: {
                                  contains: ` ${query}`,
                                  mode: "insensitive" as const,
                              },
                          },
                      ]
                    : []),
            ],
        },
        select: { id: true, username: true, name: true, image: true },
        orderBy: { username: "asc" },
        // A few extra, so ranking can still put the best ones first
        take: MAX_RESULTS * 3,
    });

    const rank = (user: MentionUser) =>
        user.username === query ? 0 : user.username.startsWith(query) ? 1 : 2;
    return users.sort((a, b) => rank(a) - rank(b)).slice(0, MAX_RESULTS);
}
