"use client";

import { Card } from "@heroui/react";
import { ComposeForm } from "@/features/posts/components/compose-form";
import { createPost } from "@/features/posts/actions/create-post";
import { POST_MAX_LENGTH } from "@/features/posts/utils/post-rules";

// `avatar` is the signed-in user's: passed in, so it can stream in on its
// own while the form shows right away
export function PostForm({ avatar }: { avatar: React.ReactNode }) {
    return (
        <Card>
            <ComposeForm
                avatar={avatar}
                placeholder="What's happening?"
                submitLabel="Post"
                maxLength={POST_MAX_LENGTH}
                action={createPost}
            />
        </Card>
    );
}
