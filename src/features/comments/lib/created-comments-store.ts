"use client";

import { createKeyedStore } from "@/lib/keyed-store";
import type { PostComment } from "./queries";

// Comments the viewer created in this tab, by post id, newest first. Every
// reply form adds to it (the popup and the one on the post's page), and the
// post's replies list shows them, so a new reply appears wherever it was
// written.
export const createdComments = createKeyedStore<PostComment[]>();

export function addCreatedComment(postId: string, comment: PostComment) {
    createdComments.set(postId, [
        comment,
        ...(createdComments.get(postId) ?? []),
    ]);
}
