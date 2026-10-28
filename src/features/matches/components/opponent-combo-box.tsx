"use client";

import { useEffect, useRef, useState } from "react";
import { ComboBox, FieldError, Input, Label, ListBox } from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
    type Opponent,
    searchOpponents,
} from "@/features/matches/actions/search-opponents";

// Wait this long after the last keystroke before searching
const SEARCH_DELAY_MS = 150;

// A search field for the opponent, suggesting users by name or username as
// you type. Submits the chosen user's id as `name`; `onChange` gets them
// (null when cleared).
export function OpponentComboBox({
    name,
    onChange,
}: {
    name: string;
    onChange: (opponent: Opponent | null) => void;
}) {
    const [inputValue, setInputValue] = useState("");
    const [selected, setSelected] = useState<Opponent | null>(null);
    // The latest answer and what it was for. The suggestions stay while the
    // next search runs, so the list doesn't flicker between keystrokes.
    const [results, setResults] = useState<{
        query: string;
        users: Opponent[];
    }>({ query: "", users: [] });
    // The latest query searched for; older answers are ignored
    const latestQuery = useRef<string | null>(null);

    // Choosing a user puts their name in the field, which isn't a search
    const query =
        selected && inputValue === selected.name ? "" : inputValue.trim();
    useEffect(() => {
        if (!query) {
            return;
        }
        latestQuery.current = query;
        const timeout = setTimeout(() => {
            searchOpponents(query).then(
                (users) => {
                    if (latestQuery.current === query) {
                        setResults({ query, users });
                    }
                },
                // Keep the last suggestions; the next keystroke tries again
                () => {},
            );
        }, SEARCH_DELAY_MS);
        return () => clearTimeout(timeout);
    }, [query]);

    // The chosen user stays an option, so the field keeps showing them
    const users = query ? results.users : [];
    const items =
        selected && !users.some((user) => user.id === selected.id)
            ? [selected, ...users]
            : users;

    return (
        <ComboBox
            variant="secondary"
            isRequired
            name={name}
            items={items}
            inputValue={inputValue}
            onInputChange={setInputValue}
            selectedKey={selected?.id ?? null}
            onSelectionChange={(key) => {
                const user = items.find((item) => item.id === key) ?? null;
                setSelected(user);
                // The input value is controlled, so show the name here
                if (user) {
                    setInputValue(user.name);
                }
                onChange(user);
            }}
            // The server already matched names and usernames
            defaultFilter={() => true}
            menuTrigger="input"
            allowsEmptyCollection={query !== ""}
        >
            <Label>Opponent</Label>
            <ComboBox.InputGroup>
                <Input placeholder="Search by name or username" />
                <ComboBox.Trigger />
            </ComboBox.InputGroup>
            <ComboBox.Popover>
                <ListBox
                    renderEmptyState={() => (
                        <p className="px-3 py-2 text-sm text-muted">
                            {results.query === query
                                ? "No players found"
                                : "Searching…"}
                        </p>
                    )}
                >
                    {(user: Opponent) => (
                        <ListBox.Item id={user.id} textValue={user.name}>
                            <UserAvatar name={user.name} image={user.image} />
                            <span className="flex min-w-0 flex-1 flex-col">
                                <span className="truncate font-semibold">
                                    {user.name}
                                </span>
                                <span className="truncate text-sm text-muted">
                                    @{user.username}
                                </span>
                            </span>
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                    )}
                </ListBox>
            </ComboBox.Popover>
            <FieldError />
        </ComboBox>
    );
}
