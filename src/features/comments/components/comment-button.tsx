"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button, Modal } from "@heroui/react";
import { commentCounts } from "@/features/comments/lib/comment-count-store";
import { PostPreview } from "@/features/posts/components/post-preview";
import type { FeedPost } from "@/features/posts/lib/queries";
import { CommentForm } from "./comment-form";

// "999", "1.2K", "3.4M"
const countFormat = new Intl.NumberFormat("en", { notation: "compact" });

// The comment icon and count under a post. It opens a popup with the post
// and the reply form, which closes once the reply is saved.
export function CommentButton({ post }: { post: FeedPost }) {
    const [isOpen, setIsOpen] = useState(false);
    const commentCount = commentCounts.useValue(post.id, post.commentCount);
    const formattedCount = countFormat.format(commentCount);

    return (
        <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button
                size="sm"
                variant="ghost"
                // The label replaces the content, so it has the count
                aria-label={`Reply (${formattedCount})`}
                className="gap-1.5 px-2 text-muted tabular-nums"
            >
                <MessageCircle className="size-4" aria-hidden />
                <span>{formattedCount}</span>
            </Button>
            <Modal.Backdrop>
                <Modal.Container
                    size="lg"
                    // The whole popup scrolls, so the mention suggestions
                    // below the text area aren't cut off
                    scroll="outside"
                >
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        {/* The post being replied to; pr-8 keeps it clear
                            of the close button */}
                        <div className="mb-4 border-b border-separator pb-4 pr-8">
                            <PostPreview post={post} />
                        </div>
                        <Modal.Header>
                            <Modal.Heading>
                                Reply to @{post.author.username}
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <CommentForm
                                postId={post.id}
                                onSuccess={() => setIsOpen(false)}
                                autoFocus
                            />
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
