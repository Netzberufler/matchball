"use server";

import { z } from "zod";
import { requireSession } from "@/features/auth/lib/session";
import {
    USERNAME_MAX_LENGTH,
    USERNAME_PATTERN,
} from "@/features/auth/utils/auth-rules";
import { searchUsers } from "@/features/search/lib/queries";
import { searchQuerySchema } from "@/features/search/utils/search-query";
import { parseActionInput } from "@/lib/action-input";

// A username, the cursor of the people search
const cursorSchema = z
    .string()
    .max(USERNAME_MAX_LENGTH)
    .regex(USERNAME_PATTERN);

// The page of people found for `query` after `cursor`. Checks its
// arguments: actions can be called with anything, not just what the list
// sends.
export async function loadMoreUsers(queryInput: unknown, cursorInput: unknown) {
    await requireSession();

    const query = parseActionInput(searchQuerySchema, queryInput);
    const cursor = parseActionInput(cursorSchema, cursorInput);
    return searchUsers(query, cursor);
}
