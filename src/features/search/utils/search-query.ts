// The Explore page's search, shared by its search field, page, queries and
// actions. What's typed in the field goes into the URL as ?q=, and the page
// searches people and posts for it.
import { z } from "zod";

export const SEARCH_PARAM = "q";
// Shorter queries aren't searched: they would match nearly everything
export const SEARCH_QUERY_MIN_LENGTH = 2;
export const SEARCH_QUERY_MAX_LENGTH = 100;
// Words after these are left out
const SEARCH_TERMS_MAX = 5;

// The query as it's searched for: trimmed, with single spaces, and at most
// SEARCH_QUERY_MAX_LENGTH long. "" when there's nothing to search for, or
// too little. `raw` is what's in the field, or the ?q= value(s).
export function normalizeSearchQuery(
    raw: string | string[] | null | undefined,
) {
    const text = (Array.isArray(raw) ? raw[0] : raw) ?? "";
    const query = text
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, SEARCH_QUERY_MAX_LENGTH)
        .trim();
    return query.length >= SEARCH_QUERY_MIN_LENGTH ? query : "";
}

// A query that normalizeSearchQuery left as it is, and that isn't empty.
// For the load-more actions, which can be called with anything.
export const searchQuerySchema = z
    .string()
    .max(SEARCH_QUERY_MAX_LENGTH)
    .refine((query) => query !== "" && normalizeSearchQuery(query) === query);

// The words of a query, each searched for on its own: results match all of
// them, in any order. Each word once, and only the first few.
export function searchTerms(query: string) {
    const words = query.split(" ").filter((word) => word !== "");
    return [...new Set(words)].slice(0, SEARCH_TERMS_MAX);
}

// `text` for a LIKE pattern, matching itself only. Prisma's `contains`
// doesn't escape % and _, which would otherwise match anything.
export function escapeLike(text: string) {
    return text.replace(/[\\%_]/g, (char) => `\\${char}`);
}
