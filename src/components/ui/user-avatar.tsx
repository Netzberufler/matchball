import { Avatar } from "@heroui/react";

// The user's picture (e.g. from Google), or their initials when there is
// none, while it loads, or if it fails. Without a name (e.g. while the
// session loads) the fallback is an empty circle. alt is empty and the
// initials are hidden from screen readers because the name is always shown
// or announced next to it.
// size "md" is HeroUI's 40px; "sm" (32px) is for dense lists like the
// matches table; "lg" is for the players on a match's page; "xl" is for the
// profile page header.
export function UserAvatar({
    name,
    image,
    size = "md",
}: {
    name?: string;
    image?: string | null;
    size?: "sm" | "md" | "lg" | "xl";
}) {
    const sizeClasses = AVATAR_SIZE_CLASSES[size];
    return (
        <Avatar className={`shrink-0 ${sizeClasses.avatar}`}>
            {image && (
                <Avatar.Image
                    alt=""
                    src={image}
                    // Google's profile picture server rate-limits requests
                    // that come with a referrer (429 with an HTML page, which
                    // Firefox then blocks), so don't send one
                    referrerPolicy="no-referrer"
                />
            )}
            <Avatar.Fallback
                color="default"
                aria-hidden
                className={sizeClasses.fallback}
            >
                {name && getInitials(name)}
            </Avatar.Fallback>
        </Avatar>
    );
}

const AVATAR_SIZE_CLASSES = {
    sm: { avatar: "size-8", fallback: "text-xs" },
    md: { avatar: "", fallback: "" },
    lg: {
        avatar: "size-20 rounded-full sm:size-30",
        fallback: "text-2xl sm:text-3xl",
    },
    xl: {
        avatar: "size-24 rounded-full sm:size-35",
        fallback: "text-3xl sm:text-4xl",
    },
};

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
