import Link from "next/link";
import { Skeleton } from "@heroui/react";
import { ListCard } from "@/components/ui/list-card";
import { UserIdentity } from "@/components/ui/user-identity";
import { profilePath } from "@/features/profile/utils/profile-path";
import type { PublicUser } from "@/features/profile/utils/public-user";

// People in a card, each linking to their profile. For the follow lists
// and the people on the Explore page. `action` puts something next to each
// person, e.g. a Follow button; it's outside the link, as links can't
// contain buttons.
export function UserList<User extends PublicUser>({
    users,
    action,
}: {
    users: User[];
    action?: (user: User) => React.ReactNode;
}) {
    return (
        <ListCard>
            {users.map((user) => (
                <li
                    key={user.id}
                    // Same hover colour as posts in the feeds
                    className="flex items-center transition-colors hover:bg-surface-secondary/60"
                >
                    <Link
                        href={profilePath(user.username)}
                        className="flex min-w-0 flex-1 items-center gap-3 p-4"
                    >
                        <UserIdentity user={user} />
                    </Link>
                    {action && (
                        <div className="shrink-0 pr-4">{action(user)}</div>
                    )}
                </li>
            ))}
        </ListCard>
    );
}

// Shown while a UserList loads
export function UserListFallback({ count = 3 }: { count?: number }) {
    return (
        <ListCard aria-hidden>
            {Array.from({ length: count }, (_, index) => (
                <li key={index} className="flex items-center gap-3 p-4">
                    <Skeleton className="size-10 shrink-0 rounded-full" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-3.5 w-36 rounded-full" />
                        <Skeleton className="h-3 w-24 rounded-full" />
                    </div>
                </li>
            ))}
        </ListCard>
    );
}
