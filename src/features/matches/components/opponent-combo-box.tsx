"use client";

import { useState } from "react";
import { ComboBox, FieldError, Input, Label, ListBox } from "@heroui/react";
import { UserIdentity } from "@/components/ui/user-identity";
import { searchOpponents } from "@/features/matches/actions/search-opponents";
import type { PublicUser } from "@/features/profile/utils/public-user";
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
    defaultOpponent?: PublicUser | null;
    onChange: (opponent: PublicUser | null) => void;
}) {
    const [inputValue, setInputValue] = useState(defaultOpponent?.name ?? "");
    const [selected, setSelected] = useState<PublicUser | null>(
        defaultOpponent,
    );

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
                    {(user: PublicUser) => (
                        <ListBox.Item id={user.id} textValue={user.name}>
                            <UserIdentity user={user} className="flex-1" />
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                    )}
                </ListBox>
            </ComboBox.Popover>
            <FieldError />
        </ComboBox>
    );
}
