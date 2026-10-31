import { UserAvatar } from "@/components/ui/user-avatar";
import type { PublicUser } from "@/features/profile/utils/public-user";

// A user's picture with their name and @username below each other, both
// cut off to fit, e.g. in lists and suggestions. Put it in the link or
// option for the user, with a gap between its children. The name takes
// the color around it. `className` goes on the name and username, e.g.
// "flex-1" to push something to the end.
export function UserIdentity({
    user,
    className = "",
}: {
    user: Pick<PublicUser, "name" | "username" | "image">;
    className?: string;
}) {
    return (
        <>
            <UserAvatar name={user.name} image={user.image} />
            <span className={`flex min-w-0 flex-col ${className}`}>
                <span className="truncate font-semibold">{user.name}</span>
                {/* Spaces the text for screen readers; the line break does
                    the visual spacing */}{" "}
                <span className="truncate text-sm text-muted">
                    @{user.username}
                </span>
            </span>
        </>
    );
}
