import "server-only";

import { z } from "zod";

// Server actions are public endpoints: anyone can call them with any
// arguments, not just what the app's components send. Every action checks
// its arguments with a schema before using them. Form data is checked with
// the forms' own schemas (see src/lib/form-validation.ts); these are for
// the other arguments.

// A row id: Prisma generates UUIDv7s (see schema.prisma)
export const idSchema = z.uuid();

// A paging cursor (see src/features/posts/utils/feed.ts). Rebuilt from its
// two fields, so nothing else that was sent along reaches a query.
export const feedCursorSchema = z.object({
    createdAt: z.date(),
    id: idSchema,
});

// `input` checked against `schema`. A mismatch means the call didn't come
// from the app, so it fails with an error that tells nothing about the
// checks.
export function parseActionInput<T extends z.ZodType>(
    schema: T,
    input: unknown,
): z.output<T> {
    const result = schema.safeParse(input);
    if (!result.success) {
        throw new Error("Invalid request");
    }
    return result.data;
}
