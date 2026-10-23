"use client";

import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    useTransition,
} from "react";
import { Button, FieldError, Form, TextArea, TextField } from "@heroui/react";
import { MentionSuggestions } from "@/features/mentions/components/mention-suggestions";
import { useMentionAutocomplete } from "@/features/mentions/components/use-mention-autocomplete";
import { splitTypedMentions } from "@/features/mentions/utils/mentions";

// Show the character count in warning colours from this many left on
const LOW_CHARACTERS_LEFT = 20;

// The width each text area's height was last fitted at
const fittedWidths = new WeakMap<HTMLTextAreaElement, number>();

// Grows (and shrinks) a text area with its text instead of scrolling. CSS
// field-sizing: content would do this, but Firefox lacks it. Its min-height
// still applies.
function fitHeight(textArea: HTMLTextAreaElement) {
    fittedWidths.set(textArea, textArea.offsetWidth);
    textArea.style.height = "auto";
    // scrollHeight leaves out the borders, which the height includes
    const borders = textArea.offsetHeight - textArea.clientHeight;
    textArea.style.height = `${textArea.scrollHeight + borders}px`;
}

// A plain-text form with a character limit and count: the user's avatar on
// the left; beside it the text area, and below that the submit button
// (lined up with the text area) and the count. Typing "@" suggests users to
// mention. Used for posts and comments. `action` saves the text; on success
// the form is cleared.
export function ComposeForm({
    avatar,
    placeholder,
    submitLabel,
    maxLength,
    action,
    onSuccess,
    autoFocus,
    initialContent = "",
}: {
    // The signed-in user's avatar
    avatar: React.ReactNode;
    // Also the text area's accessible name
    placeholder: string;
    submitLabel: string;
    maxLength: number;
    action: (formData: FormData) => Promise<{ error: string | null }>;
    onSuccess?: () => void;
    autoFocus?: boolean;
    // E.g. "@username " for a reply to a reply; also what the form goes
    // back to after sending
    initialContent?: string;
}) {
    const [content, setContent] = useState(initialContent);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    // Where to put the caret once a chosen mention is in the text
    // Starts after the initial content, so typing continues after it
    const caretAfterInsert = useRef<number | null>(
        initialContent ? initialContent.length : null,
    );

    const mentions = useMentionAutocomplete({
        textAreaRef,
        onInsert: (text, caret) => {
            // Leave the text as it is if the mention doesn't fit
            if (text.length > maxLength) {
                return;
            }
            caretAfterInsert.current = caret;
            setContent(text);
        },
    });

    useLayoutEffect(() => {
        const textArea = textAreaRef.current;
        if (!textArea) {
            return;
        }
        fitHeight(textArea);
        if (caretAfterInsert.current !== null) {
            textArea.setSelectionRange(
                caretAfterInsert.current,
                caretAfterInsert.current,
            );
            caretAfterInsert.current = null;
        }
    }, [content]);

    // The text wraps differently at another width, e.g. after a resize, or
    // when the page wasn't fully laid out yet at the first fit. Only width
    // changes count: the height set by fitHeight mustn't start it again.
    useEffect(() => {
        const textArea = textAreaRef.current;
        if (!textArea) {
            return;
        }
        const observer = new ResizeObserver(() => {
            if (textArea.offsetWidth !== fittedWidths.get(textArea)) {
                fitHeight(textArea);
            }
        });
        observer.observe(textArea);
        return () => observer.disconnect();
    }, []);

    const charactersLeft = maxLength - content.length;
    const isEmpty = content.trim().length === 0;

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        setError(null);
        startTransition(async () => {
            const result = await action(formData);
            if (result.error) {
                setError(result.error);
            } else {
                caretAfterInsert.current = initialContent.length;
                setContent(initialContent);
                onSuccess?.();
            }
        });
    }

    return (
        <Form
            className="flex flex-row gap-3"
            validationErrors={error ? { content: error } : {}}
            onSubmit={onSubmit}
        >
            <div className="shrink-0">{avatar}</div>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
                <TextField
                    aria-label={placeholder}
                    variant="secondary"
                    name="content"
                    value={content}
                    onChange={(value) => {
                        setContent(value);
                        setError(null);
                        mentions.update();
                    }}
                    maxLength={maxLength}
                    autoFocus={autoFocus}
                    // For the suggestions below it
                    className="relative"
                >
                    {/* A text area can't colour parts of its text, so its own
                        text is transparent and a copy on top shows it, with
                        the @mentions in blue. The copy has the same box and
                        font, so it lines up exactly, and ignores the mouse:
                        typing, the caret and selecting all stay the text
                        area's. */}
                    <div className="relative">
                        <TextArea
                            ref={textAreaRef}
                            fullWidth
                            className="min-h-18 resize-none overflow-hidden text-lg text-transparent caret-field-foreground"
                            placeholder={placeholder}
                            {...mentions.textAreaProps}
                            onKeyDown={mentions.onKeyDown}
                            // The caret can move without typing
                            onKeyUp={(event) => {
                                if (
                                    !["ArrowDown", "ArrowUp"].includes(
                                        event.key,
                                    )
                                ) {
                                    mentions.update();
                                }
                            }}
                            onClick={mentions.update}
                            onBlur={mentions.close}
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 overflow-hidden rounded-field border-solid border-transparent px-3 py-2 text-lg break-words whitespace-pre-wrap text-field-foreground"
                            // The text area's border, so the text lines up
                            style={{ borderWidth: "var(--border-width-field)" }}
                        >
                            {splitTypedMentions(content).map((part, index) =>
                                part.type === "mention" ? (
                                    <span key={index} className="text-accent">
                                        {part.text}
                                    </span>
                                ) : (
                                    part.text
                                ),
                            )}
                        </div>
                    </div>
                    {mentions.isOpen && (
                        <MentionSuggestions
                            listId={mentions.listId}
                            users={mentions.users}
                            activeIndex={mentions.activeIndex}
                            optionId={mentions.optionId}
                            onChoose={mentions.choose}
                        />
                    )}
                    <FieldError />
                </TextField>

                <div className="flex items-center justify-between gap-3">
                    <Button
                        type="submit"
                        isDisabled={isEmpty}
                        isPending={isPending}
                    >
                        {submitLabel}
                    </Button>
                    <span
                        className={`text-sm tabular-nums ${
                            charactersLeft <= LOW_CHARACTERS_LEFT
                                ? "text-warning"
                                : "text-muted"
                        }`}
                        aria-live="polite"
                    >
                        {content.length} / {maxLength}
                        <span className="sr-only"> characters used</span>
                    </span>
                </div>
            </div>
        </Form>
    );
}
