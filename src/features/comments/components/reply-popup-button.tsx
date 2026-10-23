"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button, Modal } from "@heroui/react";
import {
    PostPreview,
    type PreviewItem,
} from "@/features/posts/components/post-preview";
import { CommentForm } from "./comment-form";

// "999", "1.2K", "3.4M"
const countFormat = new Intl.NumberFormat("en", { notation: "compact" });

// The comment icon and reply count under a post or comment. It opens a
// popup with what's replied to and the reply form, which closes once the
// reply is saved. Without `replyToId` it replies to the post, with it to
// that comment.
export function ReplyPopupButton({
    postId,
    replyToId,
    item,
    count,
}: {
    postId: string;
    replyToId?: string;
    // The post or comment replied to, shown in the popup
    item: PreviewItem;
    count: number;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const formattedCount = countFormat.format(count);
    const { username } = item.author;

    return (
        <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button
                size="sm"
                variant="ghost"
                // The label replaces the content, so it has the count
                aria-label={`Reply to @${username} (${formattedCount} replies)`}
                className="gap-1.5 px-2 text-muted tabular-nums"
            >
                {/* No negative left margin (HeroUI gives button icons one),
                    so the icon lines up with the text above it */}
                <MessageCircle className="ml-0 size-4" aria-hidden />
                <span>{formattedCount}</span>
            </Button>
            <Modal.Backdrop>
                {/* Not scroll="outside": with it, the popup never finishes
                    closing (HeroUI waits for an exit animation that doesn't
                    end) */}
                <Modal.Container size="lg">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        {/* What's replied to; pr-8 keeps it clear of the
                            close button */}
                        <div className="mb-4 border-b border-separator pb-4 pr-8">
                            <PostPreview post={item} />
                        </div>
                        <Modal.Header>
                            <Modal.Heading>Reply to @{username}</Modal.Heading>
                        </Modal.Header>
                        {/* Visible overflow, so the mention suggestions
                            below the text area aren't cut off */}
                        <Modal.Body className="overflow-visible">
                            <CommentForm
                                postId={postId}
                                replyTo={
                                    replyToId
                                        ? { id: replyToId, username }
                                        : undefined
                                }
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
