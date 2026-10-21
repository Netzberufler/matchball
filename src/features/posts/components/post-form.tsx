"use client";

import { useState, useTransition } from "react";
import {
    Button,
    Card,
    FieldError,
    Form,
    TextArea,
    TextField,
} from "@heroui/react";
import { createPost } from "@/features/posts/actions/create-post";
import { POST_MAX_LENGTH } from "@/features/posts/utils/post-rules";

// Show the remaining characters in warning colours from here on
const LOW_CHARACTERS_LEFT = 20;

export function PostForm() {
    const [content, setContent] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const charactersLeft = POST_MAX_LENGTH - content.length;
    const isEmpty = content.trim().length === 0;

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        setError(null);
        startTransition(async () => {
            const result = await createPost(formData);
            if (result.error) {
                setError(result.error);
            } else {
                setContent("");
            }
        });
    }

    return (
        <Card>
            <Form
                className="flex flex-col gap-3"
                validationErrors={error ? { content: error } : {}}
                onSubmit={onSubmit}
            >
                <TextField
                    aria-label="What's happening?"
                    variant="secondary"
                    name="content"
                    value={content}
                    onChange={(value) => {
                        setContent(value);
                        setError(null);
                    }}
                    maxLength={POST_MAX_LENGTH}
                >
                    <TextArea
                        className="min-h-24 resize-none text-lg"
                        placeholder="What's happening?"
                    />
                    <FieldError />
                </TextField>

                <div className="flex items-center justify-between gap-3">
                    <Button
                        type="submit"
                        isDisabled={isEmpty}
                        isPending={isPending}
                    >
                        Post
                    </Button>
                    <span
                        className={`text-sm tabular-nums ${
                            charactersLeft <= LOW_CHARACTERS_LEFT
                                ? "text-warning"
                                : "text-muted"
                        }`}
                        aria-live="polite"
                    >
                        {content.length} / {POST_MAX_LENGTH}
                        <span className="sr-only"> characters used</span>
                    </span>
                </div>
            </Form>
        </Card>
    );
}
