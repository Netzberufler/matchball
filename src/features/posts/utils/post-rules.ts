// Shared by the post form and the createPost action
import * as z from "zod/mini";

// Also the column size in schema.prisma
export const POST_MAX_LENGTH = 160;

// A post's text, trimmed
export const postContentSchema = z
    .string("Write something first")
    .check(
        z.trim(),
        z.minLength(1, "Write something first"),
        z.maxLength(
            POST_MAX_LENGTH,
            `Posts can be at most ${POST_MAX_LENGTH} characters`,
        ),
    );
