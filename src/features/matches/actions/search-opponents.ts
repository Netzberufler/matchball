"use server";

import { requireSession } from "@/features/auth/lib/session";
import { NAME_MAX_LENGTH } from "@/features/auth/utils/auth-rules";
import { prisma } from "@/prisma/db";

// Shown in the dropdown at most
const MAX_RESULTS = 6;
// Names are searched from this many characters on: shorter patterns can't
// use the trigram index on User.name
const NAME_SEARCH_MIN_LENGTH = 3;

export type Opponent = {
    id: string;
    username: string;
    name: string;
    image: string | null;
};

// Users to suggest as the opponent in the add match form, by username or
// name. Like the mention search (searchMentionUsers): usernames starting
// with the query, and from a few characters on, names with a word starting
// with it. Never the signed-in user, who can't play themselves.
export async function searchOpponents(query: unknown): Promise<Opponent[]> {
    const { user } = await requireSession();

    // Checked here: actions can be called with anything
    if (typeof query !== "string") {
        return [];
    }
    const text = query.trim().replace(/^@/, "");
    if (text.length === 0 || text.length > NAME_MAX_LENGTH) {
        return [];
    }
    const username = text.toLowerCase();

    const users = await prisma.user.findMany({
        where: {
            id: { not: user.id },
            OR: [
                { username: { startsWith: username } },
                ...(text.length >= NAME_SEARCH_MIN_LENGTH
                    ? [
                          {
                              name: {
                                  startsWith: text,
                                  mode: "insensitive" as const,
                              },
                          },
                          {
                              name: {
                                  contains: ` ${text}`,
                                  mode: "insensitive" as const,
                              },
                          },
                      ]
                    : []),
            ],
        },
        select: { id: true, username: true, name: true, image: true },
        orderBy: { name: "asc" },
        // A few extra, so ranking can still put the best ones first
        take: MAX_RESULTS * 3,
    });

    const rank = (found: Opponent) =>
        found.username === username
            ? 0
            : found.name.toLowerCase().startsWith(username)
              ? 1
              : found.username.startsWith(username)
                ? 2
                : 3;
    return users.sort((a, b) => rank(a) - rank(b)).slice(0, MAX_RESULTS);
}
