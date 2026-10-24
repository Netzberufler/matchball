import "server-only";

// Notifications are written by the actions that cause them (replies, likes,
// mentions and follows), in the same transaction, so they can't go missing
// or outlive an unlike or unfollow. Nobody is notified of their own
// replies, likes or mentions.

// The notifications of the users mentioned in a new post or reply, as rows
// for a createMany nested in its create (which sets postId or commentId).
// `repliedToId` is the user the reply answers: they're notified of the reply,
// which starts with their @mention, so not of the mention as well.
export function mentionNotifications(
    mentions: { userId: string }[],
    actorId: string,
    repliedToId: string | null = null,
) {
    return mentions
        .filter(({ userId }) => userId !== actorId && userId !== repliedToId)
        .map(({ userId }) => ({ userId, actorId, type: "MENTION" as const }));
}
