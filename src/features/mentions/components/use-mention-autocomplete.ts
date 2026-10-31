"use client";

import { useId, useState } from "react";
import {
    type MentionUser,
    searchMentionUsers,
} from "@/features/mentions/actions/search-mention-users";
import { findMentionBeforeCaret } from "@/features/mentions/utils/mentions";
import { useDebouncedSearch } from "@/lib/use-debounced-search";

type Mention = { start: number; query: string };

// The @mention autocomplete of a text area: finds the "@query" being typed
// before the caret, searches users for it, and inserts the chosen one.
// The text area calls `update` when its text or caret changes and passes
// keys to `onKeyDown`; `listProps` and `optionProps` go on the suggestions.
export function useMentionAutocomplete({
    textAreaRef,
    onInsert,
}: {
    textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
    // Gets the new text and where the caret should go
    onInsert: (text: string, caret: number) => void;
}) {
    const listId = useId();
    const [mention, setMention] = useState<Mention | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const query = mention?.query ?? "";
    // New suggestions start with the first one highlighted
    const { results: users, reset } = useDebouncedSearch<MentionUser>(
        query,
        searchMentionUsers,
        () => setActiveIndex(0),
    );

    const isOpen = mention !== null && query !== "" && users.length > 0;

    // Reads the @mention before the caret, e.g. after typing or moving it
    function update() {
        const textArea = textAreaRef.current;
        if (!textArea) {
            return;
        }
        const next = findMentionBeforeCaret(
            textArea.value.slice(0, textArea.selectionStart),
        );
        // A different mention (or none): don't show the old suggestions
        if (next?.start !== mention?.start) {
            reset();
        }
        setMention(next);
    }

    function close() {
        setMention(null);
        reset();
    }

    // Replaces "@query" with "@username " and puts the caret after it
    function choose(user: MentionUser) {
        const textArea = textAreaRef.current;
        if (!textArea || !mention) {
            return;
        }
        const before = textArea.value.slice(0, mention.start);
        const after = textArea.value.slice(textArea.selectionStart);
        const inserted = `@${user.username} `;
        onInsert(before + inserted + after, before.length + inserted.length);
        close();
    }

    // While suggestions show: arrow keys move through them, Enter or Tab
    // chooses one and Escape closes them
    function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (!isOpen || event.nativeEvent.isComposing) {
            return;
        }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const step = event.key === "ArrowDown" ? 1 : -1;
            setActiveIndex(
                (index) => (index + step + users.length) % users.length,
            );
        } else if (event.key === "Enter" || event.key === "Tab") {
            event.preventDefault();
            choose(users[activeIndex]!);
        } else if (event.key === "Escape") {
            event.preventDefault();
            // Close the suggestions, not a popup the form is in
            event.stopPropagation();
            close();
        }
    }

    const optionId = (index: number) => `${listId}-option-${index}`;

    return {
        isOpen,
        users,
        activeIndex,
        update,
        close,
        choose,
        onKeyDown,
        // For the text area: it suggests from a list, and which one is active
        textAreaProps: {
            "aria-autocomplete": "list" as const,
            "aria-controls": isOpen ? listId : undefined,
            "aria-activedescendant": isOpen ? optionId(activeIndex) : undefined,
        },
        listId,
        optionId,
    };
}
