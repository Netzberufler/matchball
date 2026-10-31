import "server-only";

import { z } from "zod";
import { NAME_MAX_LENGTH } from "@/features/auth/utils/auth-rules";
import type { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";
import {
    type PublicUser,
    publicUserSelect,
} from "@/features/profile/utils/public-user";

// Shown in a dropdown or popup at most
export const MAX_RESULTS = 6;
// Loaded for that, a few extra, so ranking can still put the best ones
// first
export const CANDIDATES_COUNT = MAX_RESULTS * 3;
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

// Usernames starting with `username` (on their unique index), and from a
// few characters on, names with a word starting with `text` (on the
// trigram index). `username` is already lowercase, like stored usernames.
export function nameOrUsernameWhere(
    username: string,
    text: string,
): Prisma.UserWhereInput {
    return {
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
    };
}

// Users to suggest for what was typed in a search field (e.g. the opponent
// field, or the New chat popup), by username or name. Like the mention
// search (searchMentionUsers): usernames starting with the query, and from
// a few characters on, names with a word starting with it. Never
// `excludeId`, the signed-in user. Takes the unchecked action argument.
export async function findUsersByNameOrUsername(
    query: unknown,
    excludeId: string,
): Promise<PublicUser[]> {
    const parsed = searchQuerySchema.safeParse(query);
    if (!parsed.success) {
        return [];
    }
    const text = parsed.data;
    const username = text.toLowerCase();

    const users = await prisma.user.findMany({
        where: {
            id: { not: excludeId },
            ...nameOrUsernameWhere(username, text),
        },
        select: publicUserSelect,
        orderBy: { name: "asc" },
        take: CANDIDATES_COUNT,
    });

    const rank = (found: PublicUser) =>
        found.username === username
            ? 0
            : found.name.toLowerCase().startsWith(username)
              ? 1
              : found.username.startsWith(username)
                ? 2
                : 3;
    return users.sort((a, b) => rank(a) - rank(b)).slice(0, MAX_RESULTS);
}
