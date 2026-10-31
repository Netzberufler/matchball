import type { CommentPage } from "@/features/comments/lib/queries";
import { replaceItems } from "@/features/posts/utils/feed";

// Puts a freshly loaded first page of a post's comments into the shown
// ones, e.g. after a refresh. The comments and replies already shown take
// its version, e.g. with the author's new name, and keep their place. It's
// the oldest comments, so the ones it adds are newer than all shown ones
// and go at the end. If everything was shown, more may have come since, so
// the list goes on where the fresh page does.
export function mergeLatestComments(
    current: CommentPage,
    latest: CommentPage,
): CommentPage {
    const shownIds = new Set(current.items.map((comment) => comment.id));
    const shownReplyIds = new Set(current.replies.map((reply) => reply.id));
    return {
        items: [
            ...replaceItems(current.items, latest.items),
            ...latest.items.filter((comment) => !shownIds.has(comment.id)),
        ],
        replies: [
            ...replaceItems(current.replies, latest.replies),
            ...latest.replies.filter((reply) => !shownReplyIds.has(reply.id)),
        ],
        nextCursor: current.nextCursor ?? latest.nextCursor,
    };
}
