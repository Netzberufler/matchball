import "server-only";

import { z } from "zod";
import { NAME_MAX_LENGTH } from "@/features/auth/utils/auth-rules";
import { prisma } from "@/prisma/db";

// Shown in a dropdown or popup at most
const MAX_RESULTS = 6;
// Names are searched from this many characters on: shorter patterns can't
// use the trigram index on User.name
const NAME_SEARCH_MIN_LENGTH = 3;

// What was typed in a user search field: a name or username, maybe with an
// "@". Its length is checked before anything else happens to it.
const searchQuerySchema = z
    .string()
    .max(NAME_MAX_LENGTH + 10)
    .trim()
    .transform((text) => text.replace(/^@/, ""))
    .pipe(z.string().min(1).max(NAME_MAX_LENGTH));

export type FoundUser = {
    id: string;
    username: string;
    name: string;
    image: string | null;
};

// Users to suggest for what was typed in a search field (e.g. the opponent
// field, or the New chat popup), by username or name. Like the mention
// search (searchMentionUsers): usernames starting with the query, and from
// a few characters on, names with a word starting with it. Never
// `excludeId`, the signed-in user. Takes the unchecked action argument.
export async function findUsersByNameOrUsername(
    query: unknown,
    excludeId: string,
): Promise<FoundUser[]> {
    const parsed = searchQuerySchema.safeParse(query);
    if (!parsed.success) {
        return [];
    }
    const text = parsed.data;
    const username = text.toLowerCase();

    const users = await prisma.user.findMany({
        where: {
            id: { not: excludeId },
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

    const rank = (found: FoundUser) =>
        found.username === username
            ? 0
            : found.name.toLowerCase().startsWith(username)
              ? 1
              : found.username.startsWith(username)
                ? 2
                : 3;
    return users.sort((a, b) => rank(a) - rank(b)).slice(0, MAX_RESULTS);
}
