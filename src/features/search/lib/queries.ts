import "server-only";

import type { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/prisma/db";
import type { FeedPage } from "@/features/posts/utils/feed";
import { escapeLike, searchTerms } from "@/features/search/utils/search-query";

// People shown per page. Fewer than posts, so the posts below still show
// on the first screen.
export const USER_SEARCH_PAGE_SIZE = 5;

const userSelect = { id: true, username: true, name: true, image: true };

export type SearchUser = Prisma.UserGetPayload<{ select: typeof userSelect }>;

// People are listed by username, which is unique, so the last username of a
// page is the cursor for the next one
export type UserSearchCursor = string;

// Users with `term` anywhere in their username or name, case-insensitive.
// A leading @ is left out, so "@tom" finds the username "tom". Usernames are
// stored lowercase. Both columns have a trigram index.
function userTermWhere(term: string): Prisma.UserWhereInput {
    const pattern = escapeLike(term);
    return {
        OR: [
            { username: { contains: pattern.toLowerCase() } },
            { name: { contains: pattern, mode: "insensitive" } },
        ],
    };
}

// One page of the people matching every word of a normalized query, by
// username. A username typed in full comes first, ahead of the others on
// the first page.
export async function searchUsers(
    query: string,
    cursor?: UserSearchCursor,
): Promise<FeedPage<SearchUser, UserSearchCursor>> {
    const terms = searchTerms(query)
        .map((term) => term.replace(/^@/, ""))
        .filter((term) => term !== "");
    if (terms.length === 0) {
        return { items: [], nextCursor: null };
    }
    const exactUsername = terms.length === 1 ? terms[0].toLowerCase() : null;

    const [exactUser, users] = await Promise.all([
        exactUsername && !cursor
            ? prisma.user.findUnique({
                  where: { username: exactUsername },
                  select: userSelect,
              })
            : null,
        prisma.user.findMany({
            where: {
                AND: [
                    ...terms.map(userTermWhere),
                    // Already on the first page, if it exists
                    ...(exactUsername
                        ? [{ username: { not: exactUsername } }]
                        : []),
                    ...(cursor ? [{ username: { gt: cursor } }] : []),
                ],
            },
            select: userSelect,
            orderBy: { username: "asc" },
            // One extra user tells whether there is another page
            take: USER_SEARCH_PAGE_SIZE + 1,
        }),
    ]);

    const hasMore = users.length > USER_SEARCH_PAGE_SIZE;
    const items = users.slice(0, USER_SEARCH_PAGE_SIZE);
    return {
        items: exactUser ? [exactUser, ...items] : items,
        nextCursor: hasMore ? (items.at(-1)?.username ?? null) : null,
    };
}
