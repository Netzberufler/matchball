"use client";

import { UserIdentity } from "@/components/ui/user-identity";
import type { PublicUser } from "@/features/profile/utils/public-user";

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
    users: PublicUser[];
    activeIndex: number;
    optionId: (index: number) => string;
    onChoose: (user: PublicUser) => void;
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
                    <UserIdentity user={user} />
                </li>
            ))}
        </ul>
    );
}
