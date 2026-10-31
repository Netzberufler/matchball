"use client";

import { useRef, useState, useTransition } from "react";
import { SendHorizontal } from "lucide-react";
import { Button, FieldError, Form, TextArea, TextField } from "@heroui/react";
import { MESSAGE_MAX_LENGTH } from "@/features/messages/utils/message-rules";

// The field to write a message in, with the send button beside it. Enter
// sends, Shift+Enter starts a new line. `action` sends the text; on
// success the field is cleared.
export function MessageForm({
    recipientName,
    action,
}: {
    recipientName: string;
    action: (formData: FormData) => Promise<{ error: string | null }>;
}) {
    const [content, setContent] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    const isEmpty = content.trim().length === 0;

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isEmpty || isPending) {
            return;
        }
        const formData = new FormData(event.currentTarget);

        setError(null);
        startTransition(async () => {
            try {
                const result = await action(formData);
                if (result.error) {
                    setError(result.error);
                } else {
                    setContent("");
                }
            } catch {
                setError("Couldn't send your message. Please try again.");
            }
        });
    }

    return (
        <Form
            ref={formRef}
            className="flex flex-row items-end gap-2"
            validationErrors={error ? { content: error } : {}}
            onSubmit={onSubmit}
        >
            <TextField
                aria-label={`Message ${recipientName}`}
                variant="secondary"
                name="content"
                value={content}
                onChange={(value) => {
                    setContent(value);
                    setError(null);
                }}
                maxLength={MESSAGE_MAX_LENGTH}
                autoFocus
                className="min-w-0 flex-1"
            >
                <TextArea
                    fullWidth
                    rows={1}
                    // Grows with the text up to a few lines, then scrolls
                    className="max-h-40 resize-none [field-sizing:content]"
                    placeholder="Write a message"
                    onKeyDown={(event) => {
                        if (
                            event.key === "Enter" &&
                            !event.shiftKey &&
                            // Not while an input method is composing
                            !event.nativeEvent.isComposing
                        ) {
                            event.preventDefault();
                            formRef.current?.requestSubmit();
                        }
                    }}
                />
                <FieldError />
            </TextField>
            <Button
                type="submit"
                isIconOnly
                aria-label="Send"
                isDisabled={isEmpty}
                isPending={isPending}
            >
                <SendHorizontal className="size-5" aria-hidden />
            </Button>
        </Form>
    );
}
