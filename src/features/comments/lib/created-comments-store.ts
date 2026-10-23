"use client";

import { createKeyedStore } from "@/lib/keyed-store";
import type { PostComment } from "./queries";

// Comments the viewer created in this tab, newest first, by the list they
// belong in: "post:<id>" for a post's top-level comments, "thread:<id>" for
// the replies (at any depth) in a top-level comment's thread. Every reply form adds to it (the popup and the forms
// on the post's page), and the lists show them, so a new reply appears
// wherever it was written.
export const createdComments = createKeyedStore<PostComment[]>();

export function addCreatedComment(listKey: string, comment: PostComment) {
    createdComments.set(listKey, [
        comment,
        ...(createdComments.get(listKey) ?? []),
    ]);
}

// The list a new comment belongs in
export function commentListKey(comment: PostComment, postId: string) {
    return comment.rootId ? `thread:${comment.rootId}` : `post:${postId}`;
}
