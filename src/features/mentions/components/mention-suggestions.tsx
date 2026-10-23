"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import type { MentionUser } from "@/features/mentions/actions/search-mention-users";

// The users suggested for an @mention, in a list below the text area.
// Focus stays in the text area: it moves through the list with the arrow
// keys (aria-activedescendant), and a click chooses without blurring it.
export function MentionSuggestions({
    listId,
    users,
    activeIndex,
    optionId,
    onChoose,
}: {
    listId: string;
    users: MentionUser[];
    activeIndex: number;
    optionId: (index: number) => string;
    onChoose: (user: MentionUser) => void;
}) {
    return (
        <ul
            id={listId}
            role="listbox"
            aria-label="Suggested users"
            className="absolute inset-x-0 top-full z-50 mt-1 max-w-sm overflow-hidden rounded-2xl bg-overlay py-1 text-overlay-foreground shadow-lg ring-1 ring-separator"
        >
            {users.map((user, index) => (
                <li
                    key={user.id}
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === activeIndex}
                    className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${
                        index === activeIndex ? "bg-default" : ""
                    }`}
                    // Choose on press without taking the focus from the text
                    // area
                    onMouseDown={(event) => {
                        event.preventDefault();
                        onChoose(user);
                    }}
                >
                    <UserAvatar name={user.name} image={user.image} />
                    <span className="flex min-w-0 flex-col">
                        <span className="truncate font-semibold">
                            {user.name}
                        </span>
                        {/* Spaces the option text for screen readers */}{" "}
                        <span className="truncate text-sm text-muted">
                            @{user.username}
                        </span>
                    </span>
                </li>
            ))}
        </ul>
    );
}
