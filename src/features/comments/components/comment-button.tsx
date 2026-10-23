"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button, Modal } from "@heroui/react";
import { commentCounts } from "@/features/comments/lib/comment-count-store";
import { CommentForm } from "./comment-form";

// "999", "1.2K", "3.4M"
const countFormat = new Intl.NumberFormat("en", { notation: "compact" });

// The comment icon and count under a post. It opens a popup with the reply
// form, which closes once the reply is saved.
export function CommentButton({
    postId,
    commentCount: initialCommentCount,
    authorUsername,
}: {
    postId: string;
    commentCount: number;
    authorUsername: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const commentCount = commentCounts.useValue(postId, initialCommentCount);
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
                <Modal.Container size="lg">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>
                                Reply to @{authorUsername}
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <CommentForm
                                postId={postId}
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
