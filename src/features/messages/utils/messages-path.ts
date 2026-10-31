export const MESSAGES_PATH = "/messages";

// The conversation with a user, whether or not they've written yet
export function conversationPath(username: string) {
    return `${MESSAGES_PATH}/${encodeURIComponent(username)}`;
}
