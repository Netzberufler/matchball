"use client";

import {
    AtSign,
    BellDot,
    Heart,
    ListFilter,
    MessageCircle,
    Sword,
    Swords,
    UserPlus,
} from "lucide-react";
import { Button, Chip, Dropdown, Label } from "@heroui/react";
import { MenuCheckbox, toSelectedKeys } from "@/components/ui/filter-menus";
import {
    NOTIFICATION_SHOW_FILTERS,
    NOTIFICATION_TYPE_FILTERS,
    NOTIFICATION_TYPE_KEYS,
    type NotificationShowFilter,
    type NotificationTypeFilter,
} from "@/features/notifications/utils/notification-filters";

// The icons of the notifications each type shows, as in the list
const TYPE_ICONS = {
    followers: UserPlus,
    mentions: AtSign,
    replies: MessageCircle,
    likes: Heart,
    matches: Swords,
    // The icon of Challenges in the nav
    challenges: Sword,
} satisfies Record<NotificationTypeFilter, unknown>;

// Any number of types, in a menu that stays open while ticking them. The
// button shows how many are ticked.
export function NotificationTypeMenu({
    types,
    onChange,
    isDisabled,
}: {
    types: NotificationTypeFilter[];
    onChange: (types: NotificationTypeFilter[]) => void;
    isDisabled?: boolean;
}) {
    return (
        <Dropdown>
            <Button variant="tertiary" size="sm" isDisabled={isDisabled}>
                <ListFilter className="size-4" aria-hidden />
                Type
                {types.length > 0 && (
                    <Chip size="sm" color="accent" variant="primary">
                        {types.length}
                    </Chip>
                )}
            </Button>
            <Dropdown.Popover placement="bottom start" className="min-w-48">
                <Dropdown.Menu
                    aria-label="Filter by type"
                    selectionMode="multiple"
                    selectedKeys={types}
                    onSelectionChange={(keys) =>
                        onChange(
                            toSelectedKeys(
                                keys,
                                NOTIFICATION_TYPE_KEYS,
                            ) as NotificationTypeFilter[],
                        )
                    }
                    shouldCloseOnSelect={false}
                >
                    {NOTIFICATION_TYPE_FILTERS.map((option) => {
                        const Icon = TYPE_ICONS[option.key];
                        return (
                            <Dropdown.Item
                                key={option.key}
                                id={option.key}
                                textValue={option.label}
                            >
                                <MenuCheckbox />
                                <Icon
                                    className="size-4 text-muted"
                                    aria-hidden
                                />
                                <Label>{option.label}</Label>
                            </Dropdown.Item>
                        );
                    })}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}

// All notifications or only the new ones. The button shows the choice
// unless it's all.
export function NotificationShowMenu({
    show,
    onChange,
    isDisabled,
}: {
    show: NotificationShowFilter;
    onChange: (show: NotificationShowFilter) => void;
    isDisabled?: boolean;
}) {
    const label = NOTIFICATION_SHOW_FILTERS.find(
        (option) => option.key === show,
    )?.label;
    return (
        <Dropdown>
            <Button variant="tertiary" size="sm" isDisabled={isDisabled}>
                <BellDot className="size-4" aria-hidden />
                Show
                {show !== "all" && (
                    <Chip size="sm" color="accent" variant="primary">
                        {label}
                    </Chip>
                )}
            </Button>
            <Dropdown.Popover placement="bottom start">
                <Dropdown.Menu
                    aria-label="Show all or only new notifications"
                    selectionMode="single"
                    disallowEmptySelection
                    selectedKeys={[show]}
                    onSelectionChange={(keys) => {
                        const [next] = keys as Set<NotificationShowFilter>;
                        if (next) {
                            onChange(next);
                        }
                    }}
                >
                    {NOTIFICATION_SHOW_FILTERS.map((option) => (
                        <Dropdown.Item
                            key={option.key}
                            id={option.key}
                            textValue={option.label}
                        >
                            <Dropdown.ItemIndicator type="dot" />
                            <Label>{option.label}</Label>
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}
