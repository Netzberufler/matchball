import { describe, expect, it } from "vitest";
import type { CommentPage, PostComment } from "@/features/comments/lib/queries";
import { mergeLatestComments } from "@/features/comments/utils/comment-page";

const CURSOR = { createdAt: new Date("2026-10-12T10:00:00Z"), id: "b" };

// Only what the merge looks at
function comment(id: string, name = "Old") {
    return { id, name } as unknown as PostComment;
}

function page(
    items: PostComment[],
    replies: PostComment[] = [],
    nextCursor: CommentPage["nextCursor"] = null,
): CommentPage {
    return { items, replies, nextCursor };
}

describe("mergeLatestComments", () => {
    it("shows the fresh version of comments and replies already shown", () => {
        const merged = mergeLatestComments(
            page([comment("a"), comment("b")], [comment("r")]),
            page([comment("a", "New")], [comment("r", "New")]),
        );
        expect(merged.items).toEqual([comment("a", "New"), comment("b")]);
        expect(merged.replies).toEqual([comment("r", "New")]);
    });

    it("adds new comments and replies at the end", () => {
        const merged = mergeLatestComments(
            page([comment("a")], [comment("r")]),
            page([comment("a"), comment("b")], [comment("r"), comment("s")]),
        );
        expect(merged.items.map(({ id }) => id)).toEqual(["a", "b"]);
        expect(merged.replies.map(({ id }) => id)).toEqual(["r", "s"]);
    });

    it("keeps the pages loaded below", () => {
        const current = page([comment("a"), comment("b")], [], CURSOR);
        const merged = mergeLatestComments(
            current,
            page([comment("a")], [], { ...CURSOR, id: "a" }),
        );
        expect(merged.items.map(({ id }) => id)).toEqual(["a", "b"]);
        expect(merged.nextCursor).toBe(CURSOR);
    });

    it("goes on where the fresh page does once everything was shown", () => {
        const merged = mergeLatestComments(
            page([comment("a")]),
            page([comment("a")], [], CURSOR),
        );
        expect(merged.nextCursor).toBe(CURSOR);
    });
});
