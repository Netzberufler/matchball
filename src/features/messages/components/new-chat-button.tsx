"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SquarePen } from "lucide-react";
import { Button, Modal, SearchField, Spinner } from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
    loadChatSuggestions,
    searchChatUsers,
} from "@/features/messages/actions/search-chat-users";
import type { ChatUser } from "@/features/messages/lib/queries";
import { conversationPath } from "@/features/messages/utils/messages-path";

// Wait this long after the last keystroke before searching
const SEARCH_DELAY_MS = 150;

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
                                <UserPicker onChoose={() => setIsOpen(false)} />
                            )}
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}

function UserPicker({ onChoose }: { onChoose: () => void }) {
    const [value, setValue] = useState("");
    // null until loaded, and if they couldn't be
    const [suggestions, setSuggestions] = useState<ChatUser[] | null>(null);
    // The latest answer and what it was for. The results stay while the
    // next search runs, so the list doesn't flicker between keystrokes.
    const [results, setResults] = useState<{
        query: string;
        users: ChatUser[];
    }>({ query: "", users: [] });
    // The latest query searched for; older answers are ignored
    const latestQuery = useRef<string | null>(null);

    useEffect(() => {
        loadChatSuggestions().then(setSuggestions, () => setSuggestions([]));
    }, []);

    const query = value.trim();
    useEffect(() => {
        if (!query) {
            return;
        }
        latestQuery.current = query;
        const timeout = setTimeout(() => {
            searchChatUsers(query).then(
                (users) => {
                    if (latestQuery.current === query) {
                        setResults({ query, users });
                    }
                },
                // Keep the last results; the next keystroke tries again
                () => {},
            );
        }, SEARCH_DELAY_MS);
        return () => clearTimeout(timeout);
    }, [query]);

    const isSearching = query !== "" && results.query !== query;

    return (
        <div className="flex flex-col gap-4">
            <SearchField
                aria-label="Search people"
                value={value}
                onChange={setValue}
                autoFocus
                fullWidth
            >
                <SearchField.Group>
                    {isSearching ? (
                        <SearchField.SearchIcon>
                            <Spinner
                                size="sm"
                                color="current"
                                role="status"
                                aria-label="Searching"
                            />
                        </SearchField.SearchIcon>
                    ) : (
                        <SearchField.SearchIcon />
                    )}
                    <SearchField.Input placeholder="Search by name or username" />
                    <SearchField.ClearButton />
                </SearchField.Group>
            </SearchField>
            {query ? (
                <UserChoices
                    label="People"
                    users={results.users}
                    emptyMessage={
                        isSearching && results.users.length === 0
                            ? "Searching…"
                            : "No people found"
                    }
                    onChoose={onChoose}
                />
            ) : suggestions === null ? (
                <div className="flex justify-center py-4">
                    <Spinner role="status" aria-label="Loading suggestions" />
                </div>
            ) : (
                <UserChoices
                    label="People you follow"
                    users={suggestions}
                    emptyMessage="Search for someone to chat with."
                    onChoose={onChoose}
                />
            )}
        </div>
    );
}

function UserChoices({
    label,
    users,
    emptyMessage,
    onChoose,
}: {
    label: string;
    users: ChatUser[];
    emptyMessage: string;
    onChoose: () => void;
}) {
    if (users.length === 0) {
        return <p className="py-2 text-center text-muted">{emptyMessage}</p>;
    }
    return (
        <section className="flex flex-col gap-1">
            <h3 className="text-sm font-medium text-muted">{label}</h3>
            <ul className="flex flex-col">
                {users.map((user) => (
                    <li key={user.id}>
                        <Link
                            href={conversationPath(user.username)}
                            onClick={onChoose}
                            className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-default"
                        >
                            <UserAvatar name={user.name} image={user.image} />
                            <span className="flex min-w-0 flex-col">
                                <span className="truncate font-semibold text-foreground">
                                    {user.name}
                                </span>
                                {/* Spaces the link text for screen
                                    readers */}{" "}
                                <span className="truncate text-sm text-muted">
                                    @{user.username}
                                </span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
