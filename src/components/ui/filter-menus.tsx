"use client";

import { Check, Users } from "lucide-react";
import { Button, Chip, Dropdown, Label } from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { PublicUser } from "@/features/profile/utils/public-user";

// Filter buttons above a table, each opening a menu, e.g. on /matches and
// /challenges

// A checkbox look for the items of a menu with any number ticked, so they
// read as something to tick, not one choice
export function MenuCheckbox() {
    return (
        <Dropdown.ItemIndicator>
            {({ isSelected }) => (
                <span
                    className={`flex size-4 items-center justify-center rounded border ${
                        isSelected
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border bg-field"
                    }`}
                >
                    {isSelected && (
                        <Check className="size-3" strokeWidth={3} aria-hidden />
                    )}
                </span>
            )}
        </Dropdown.ItemIndicator>
    );
}

// The keys a multiple-selection menu reports, as a list. The menu never
// selects "all" by itself; that means every one of `allKeys`.
export function toSelectedKeys(
    keys: "all" | Set<React.Key>,
    allKeys: readonly string[],
) {
    return keys === "all" ? [...allKeys] : [...keys].map(String);
}

// Any number of opponents, in a menu that stays open while ticking them,
// each with how many matches or challenges they're in. The button shows how
// many are ticked.
export function OpponentFilterMenu({
    opponentIds,
    onChange,
    opponents,
}: {
    opponentIds: string[];
    onChange: (opponentIds: string[]) => void;
    opponents: { user: PublicUser; count: number }[];
}) {
    return (
        <Dropdown>
            <Button variant="tertiary" size="sm">
                <Users className="size-4" aria-hidden />
                Opponents
                {opponentIds.length > 0 && (
                    <Chip size="sm" color="accent" variant="primary">
                        {opponentIds.length}
                    </Chip>
                )}
            </Button>
            <Dropdown.Popover placement="bottom start" className="min-w-56">
                <Dropdown.Menu
                    aria-label="Filter by opponent"
                    selectionMode="multiple"
                    selectedKeys={opponentIds}
                    onSelectionChange={(keys) =>
                        onChange(
                            toSelectedKeys(
                                keys,
                                opponents.map(({ user }) => user.id),
                            ),
                        )
                    }
                    shouldCloseOnSelect={false}
                    className="max-h-96 overflow-y-auto"
                >
                    {opponents.map(({ user, count }) => (
                        <Dropdown.Item
                            key={user.id}
                            id={user.id}
                            textValue={user.name}
                        >
                            <MenuCheckbox />
                            <UserAvatar
                                name={user.name}
                                image={user.image}
                                size="sm"
                            />
                            <span className="flex min-w-0 flex-1 flex-col">
                                <Label className="truncate">{user.name}</Label>
                                <span className="truncate text-xs text-muted">
                                    @{user.username}
                                </span>
                            </span>
                            <span className="text-xs text-muted tabular-nums">
                                {count}
                            </span>
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}
