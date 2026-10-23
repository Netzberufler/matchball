"use client";

import { Card } from "@heroui/react";
import { ComposeForm } from "@/components/ui/compose-form";
import { createPost } from "@/features/posts/actions/create-post";
import { POST_MAX_LENGTH } from "@/features/posts/utils/post-rules";

export function PostForm() {
    return (
        <Card>
            <ComposeForm
                placeholder="What's happening?"
                submitLabel="Post"
                maxLength={POST_MAX_LENGTH}
                action={createPost}
            />
        </Card>
    );
}
