// @mentions in post and comment text. Shared by the server (saving
// mentions), the text renderer and the mention autocomplete.

import {
    USERNAME_MAX_LENGTH,
    USERNAME_MIN_LENGTH,
} from "@/features/auth/utils/auth-rules";

// Saved per post or comment at most, to keep a single text from fanning out
export const MAX_MENTIONS = 10;

// "@username" at the start or after a character that can't be part of a
// username or email address, e.g. "hi @anna_b!" but not "me@mail.com"
const MENTION_PATTERN = new RegExp(
    `(^|[^a-z0-9_@])@([a-z0-9_]{${USERNAME_MIN_LENGTH},${USERNAME_MAX_LENGTH}})(?![a-z0-9_])`,
    "gi",
);

// The usernames mentioned in a text, lowercased, without repeats
export function findMentionedUsernames(text: string) {
    const usernames = new Set<string>();
    for (const match of text.matchAll(MENTION_PATTERN)) {
        usernames.add(match[2]!.toLowerCase());
        if (usernames.size === MAX_MENTIONS) {
            break;
        }
    }
    return [...usernames];
}

export type TextPart =
    | { type: "text"; text: string }
    | { type: "mention"; text: string; username: string };

// Splits a text into plain parts and the mentions of `usernames` (the ones
// that were saved, i.e. real users), e.g. to link the mentions
export function splitMentions(text: string, usernames: string[]): TextPart[] {
    if (usernames.length === 0) {
        return [{ type: "text", text }];
    }
    const known = new Set(usernames);
    return splitWhere(text, (username) => known.has(username));
}

// Splits a text into plain parts and every @mention in it, real user or
// not, e.g. to highlight them while typing
export function splitTypedMentions(text: string): TextPart[] {
    return splitWhere(text, () => true);
}

function splitWhere(
    text: string,
    isMention: (username: string) => boolean,
): TextPart[] {
    const parts: TextPart[] = [];
    let plainStart = 0;
    for (const match of text.matchAll(MENTION_PATTERN)) {
        const username = match[2]!.toLowerCase();
        if (!isMention(username)) {
            continue;
        }
        // The match starts with the character before the @
        const start = match.index + match[1]!.length;
        if (start > plainStart) {
            parts.push({ type: "text", text: text.slice(plainStart, start) });
        }
        const end = start + 1 + match[2]!.length;
        parts.push({ type: "mention", text: text.slice(start, end), username });
        plainStart = end;
    }
    if (plainStart < text.length) {
        parts.push({ type: "text", text: text.slice(plainStart) });
    }
    return parts;
}

// The @mention being typed right before the caret, for the autocomplete:
// where its @ is and what follows it so far (possibly nothing yet)
export function findMentionBeforeCaret(textBeforeCaret: string) {
    const match = new RegExp(
        `(^|[^a-z0-9_@])@([a-z0-9_]{0,${USERNAME_MAX_LENGTH}})$`,
        "i",
    ).exec(textBeforeCaret);
    if (!match) {
        return null;
    }
    return {
        start: match.index + match[1]!.length,
        query: match[2]!.toLowerCase(),
    };
}
