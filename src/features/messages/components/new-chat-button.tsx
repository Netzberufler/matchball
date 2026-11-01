"use client";

import { useState } from "react";
import Link from "next/link";
import { SquarePen } from "lucide-react";
import { Button, Modal } from "@heroui/react";
import {
    loadChatSuggestions,
    searchChatUsers,
} from "@/features/messages/actions/search-chat-users";
import { conversationPath } from "@/features/messages/utils/messages-path";
import {
    USER_CHOICE_CLASS,
    UserPicker,
} from "@/features/search/components/user-picker";

// The New chat button on /messages. It opens a popup to search for a user
// by name or username, which suggests people the user follows until
// something is typed. Choosing someone opens the conversation with them,
// which is new if they haven't written before.
export function NewChatButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button variant="primary">
                <SquarePen className="size-4" aria-hidden />
                New chat
            </Button>
            <Modal.Backdrop>
                <Modal.Container size="md">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>New chat</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            {/* Starts over each time it opens */}
                            {isOpen && (
                                <UserPicker
                                    search={searchChatUsers}
                                    loadSuggestions={loadChatSuggestions}
                                    suggestionsEmptyMessage="Search for someone to chat with."
                                    renderChoice={(user, identity) => (
                                        <Link
                                            href={conversationPath(
                                                user.username,
                                            )}
                                            onClick={() => setIsOpen(false)}
                                            className={USER_CHOICE_CLASS}
                                        >
                                            {identity}
                                        </Link>
                                    )}
                                />
                            )}
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
