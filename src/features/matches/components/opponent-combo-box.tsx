"use client";

import { useState } from "react";
import { ComboBox, FieldError, Input, Label, ListBox } from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
    type Opponent,
    searchOpponents,
} from "@/features/matches/actions/search-opponents";
import { useDebouncedSearch } from "@/lib/use-debounced-search";

// A search field for the opponent, suggesting users by name or username as
// you type. Submits the chosen user's id as `name`; `onChange` gets them
// (null when cleared). Starts with `defaultOpponent` chosen, if given.
export function OpponentComboBox({
    name,
    defaultOpponent = null,
    onChange,
}: {
    name: string;
    defaultOpponent?: Opponent | null;
    onChange: (opponent: Opponent | null) => void;
}) {
    const [inputValue, setInputValue] = useState(defaultOpponent?.name ?? "");
    const [selected, setSelected] = useState<Opponent | null>(defaultOpponent);

    // Choosing a user puts their name in the field, which isn't a search
    const query =
        selected && inputValue === selected.name ? "" : inputValue.trim();
    const { results, isSearching } = useDebouncedSearch(query, searchOpponents);

    // The chosen user stays an option, so the field keeps showing them
    const users = query ? results : [];
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
                            {isSearching ? "Searching…" : "No players found"}
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
