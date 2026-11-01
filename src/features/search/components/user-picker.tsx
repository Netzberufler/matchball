"use client";

import { useEffect, useState } from "react";
import { SearchField, Spinner } from "@heroui/react";
import { UserIdentity } from "@/components/ui/user-identity";
import type { PublicUser } from "@/features/profile/utils/public-user";
import { useDebouncedSearch } from "@/lib/use-debounced-search";

// The classes of each choice, e.g. a link or a button: the name in the
// text color rather than the popup's muted one, and a pointer on buttons
// too
export const USER_CHOICE_CLASS =
    "flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left text-foreground transition-colors hover:bg-default";

// Picks a user in a popup, e.g. to chat with or to challenge: a search by
// name or username, which suggests people the user follows until something
// is typed. `renderChoice` wraps each user's picture and name in what
// chooses them, e.g. a link; give it USER_CHOICE_CLASS. Starts over each
// time it mounts.
export function UserPicker({
    search,
    loadSuggestions,
    suggestionsEmptyMessage,
    renderChoice,
}: {
    search: (query: string) => Promise<PublicUser[]>;
    loadSuggestions: () => Promise<PublicUser[]>;
    // Shown when the user follows nobody, e.g. "Search for someone to chat
    // with."
    suggestionsEmptyMessage: string;
    renderChoice: (
        user: PublicUser,
        identity: React.ReactNode,
    ) => React.ReactNode;
}) {
    const [value, setValue] = useState("");
    // null until loaded, and if they couldn't be
    const [suggestions, setSuggestions] = useState<PublicUser[] | null>(null);

    useEffect(() => {
        loadSuggestions().then(setSuggestions, () => setSuggestions([]));
    }, [loadSuggestions]);

    const query = value.trim();
    const { results, isSearching } = useDebouncedSearch(query, search);

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
                    users={results}
                    emptyMessage={
                        isSearching && results.length === 0
                            ? "Searching…"
                            : "No people found"
                    }
                    renderChoice={renderChoice}
                />
            ) : suggestions === null ? (
                <div className="flex justify-center py-4">
                    <Spinner role="status" aria-label="Loading suggestions" />
                </div>
            ) : (
                <UserChoices
                    label="People you follow"
                    users={suggestions}
                    emptyMessage={suggestionsEmptyMessage}
                    renderChoice={renderChoice}
                />
            )}
        </div>
    );
}

function UserChoices({
    label,
    users,
    emptyMessage,
    renderChoice,
}: {
    label: string;
    users: PublicUser[];
    emptyMessage: string;
    renderChoice: (
        user: PublicUser,
        identity: React.ReactNode,
    ) => React.ReactNode;
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
                        {renderChoice(user, <UserIdentity user={user} />)}
                    </li>
                ))}
            </ul>
        </section>
    );
}
