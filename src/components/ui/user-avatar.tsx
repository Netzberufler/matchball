import { Avatar } from "@heroui/react";

// The user's picture (e.g. from Google), or their initials when there is
// none, while it loads, or if it fails. Without a name (e.g. while the
// session loads) the fallback is an empty circle. alt is empty and the
// initials are hidden from screen readers because the name is always shown
// or announced next to it.
export function UserAvatar({
    name,
    image,
}: {
    name?: string;
    image?: string | null;
}) {
    return (
        <Avatar className="shrink-0">
            {image && <Avatar.Image alt="" src={image} />}
            <Avatar.Fallback color="default" aria-hidden>
                {name && getInitials(name)}
            </Avatar.Fallback>
        </Avatar>
    );
}

// The first letters of the first two words: "Anna Becker" becomes "AB",
// "Anna Maria Becker" becomes "AM" and "Anna" becomes "A"
function getInitials(name: string) {
    return (
        name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            // Array.from keeps letters outside the BMP (e.g. emoji) whole
            .map((word) => Array.from(word)[0] ?? "")
            .join("")
            .toLocaleUpperCase()
    );
}
