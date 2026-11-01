"use client";

import { ListChecks } from "lucide-react";
import { Button, Chip, Dropdown, Label } from "@heroui/react";
import { MenuCheckbox, toSelectedKeys } from "@/components/ui/filter-menus";
import {
    CHALLENGE_STATUS_FILTERS,
    CHALLENGE_STATUS_KEYS,
    type ChallengeStatusFilter,
} from "@/features/challenges/utils/challenge-filters";

// Any number of statuses, in a menu that stays open while ticking them.
// The button shows how many are ticked.
export function ChallengeStatusMenu({
    statuses,
    onChange,
}: {
    statuses: ChallengeStatusFilter[];
    onChange: (statuses: ChallengeStatusFilter[]) => void;
}) {
    return (
        <Dropdown>
            <Button variant="tertiary" size="sm">
                <ListChecks className="size-4" aria-hidden />
                Status
                {statuses.length > 0 && (
                    <Chip size="sm" color="accent" variant="primary">
                        {statuses.length}
                    </Chip>
                )}
            </Button>
            <Dropdown.Popover placement="bottom start" className="min-w-44">
                <Dropdown.Menu
                    aria-label="Filter by status"
                    selectionMode="multiple"
                    selectedKeys={statuses}
                    onSelectionChange={(keys) =>
                        onChange(
                            toSelectedKeys(
                                keys,
                                CHALLENGE_STATUS_KEYS,
                            ) as ChallengeStatusFilter[],
                        )
                    }
                    shouldCloseOnSelect={false}
                >
                    {CHALLENGE_STATUS_FILTERS.map((option) => (
                        <Dropdown.Item
                            key={option.key}
                            id={option.key}
                            textValue={option.label}
                        >
                            <MenuCheckbox />
                            <Label>{option.label}</Label>
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}
