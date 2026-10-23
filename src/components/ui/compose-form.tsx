"use client";

import { useLayoutEffect, useRef, useState, useTransition } from "react";
import { Button, FieldError, Form, TextArea, TextField } from "@heroui/react";

// Show the character count in warning colours from this many left on
const LOW_CHARACTERS_LEFT = 20;

// A plain-text form with a character limit and count: the user's avatar on
// the left; beside it the text area, and below that the submit button
// (lined up with the text area) and the count. Used for posts and comments.
// `action` saves the text; on success the form is cleared.
export function ComposeForm({
    avatar,
    placeholder,
    submitLabel,
    maxLength,
    action,
    onSuccess,
    autoFocus,
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
}) {
    const [content, setContent] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // Grow (and shrink) the text area with its text instead of scrolling.
    // CSS field-sizing: content would do this, but Firefox lacks it. Its
    // min-height still applies.
    useLayoutEffect(() => {
        const textArea = textAreaRef.current;
        if (!textArea) {
            return;
        }
        textArea.style.height = "auto";
        // scrollHeight leaves out the borders, which the height includes
        const borders = textArea.offsetHeight - textArea.clientHeight;
        textArea.style.height = `${textArea.scrollHeight + borders}px`;
    }, [content]);

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
                setContent("");
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
                    }}
                    maxLength={maxLength}
                    autoFocus={autoFocus}
                >
                    <TextArea
                        ref={textAreaRef}
                        className="min-h-18 resize-none overflow-hidden text-lg"
                        placeholder={placeholder}
                    />
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
