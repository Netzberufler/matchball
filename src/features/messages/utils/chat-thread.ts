// Helpers for showing a conversation's messages, oldest at the top

type ThreadMessage = { id: string; createdAt: Date; isOwn: boolean };

// Messages further apart than this start a new group, with its own time
const GROUP_GAP_MS = 5 * 60 * 1000;

function compareMessages(a: ThreadMessage, b: ThreadMessage) {
    return (
        a.createdAt.getTime() - b.createdAt.getTime() ||
        (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    );
}

// `added` (older ones from above, new ones from a check, or one just sent)
// merged into `current` in order, oldest first. A message already shown,
// e.g. one just sent that the next check brings too, is shown once.
export function mergeMessages<Message extends ThreadMessage>(
    current: Message[],
    added: Message[],
): Message[] {
    const shownIds = new Set(current.map((message) => message.id));
    const newMessages = added.filter((message) => !shownIds.has(message.id));
    if (newMessages.length === 0) {
        return current;
    }
    return [...current, ...newMessages].sort(compareMessages);
}

// Whether the message ends a group: the next one is from the other user, or
// comes a while later. Groups show their time below their last message.
export function endsGroup(
    message: ThreadMessage,
    next: ThreadMessage | undefined,
) {
    return (
        next === undefined ||
        next.isOwn !== message.isOwn ||
        next.createdAt.getTime() - message.createdAt.getTime() > GROUP_GAP_MS
    );
}

const timeFormat = new Intl.DateTimeFormat("en", { timeStyle: "short" });
const dayTimeFormat = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
});
const fullFormat = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
});

// "3:42 PM" today, "Oct 12, 3:42 PM" this year, with the year before that
export function formatMessageTime(date: Date, now = new Date()) {
    if (date.toDateString() === now.toDateString()) {
        return timeFormat.format(date);
    }
    if (date.getFullYear() === now.getFullYear()) {
        return dayTimeFormat.format(date);
    }
    return fullFormat.format(date);
}
