import Link from "next/link";
import { Card, Skeleton } from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { profilePath } from "@/features/profile/utils/profile-path";

type ListedUser = {
    id: string;
    username: string;
    name: string;
    image: string | null;
};

// People in a card, each linking to their profile. For the follow lists
// and the people found on the Explore page.
export function UserList({ users }: { users: ListedUser[] }) {
    return (
        <Card className="gap-0 overflow-hidden p-0">
            <ul className="divide-y divide-separator">
                {users.map((user) => (
                    <li key={user.id}>
                        <Link
                            href={profilePath(user.username)}
                            // Same hover colour as posts in the feeds
                            className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-secondary/60"
                        >
                            <UserAvatar name={user.name} image={user.image} />
                            <span className="flex min-w-0 flex-col">
                                <span className="truncate font-semibold text-foreground">
                                    {user.name}
                                </span>
                                {/* Spaces the link text for screen
                                    readers */}{" "}
                                <span className="truncate text-sm text-muted">
                                    @{user.username}
                                </span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </Card>
    );
}

// Shown while a UserList loads
export function UserListFallback({ count = 3 }: { count?: number }) {
    return (
        <Card className="gap-0 p-0" aria-hidden>
            <ul className="divide-y divide-separator">
                {Array.from({ length: count }, (_, index) => (
                    <li key={index} className="flex items-center gap-3 p-4">
                        <Skeleton className="size-10 shrink-0 rounded-full" />
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-3.5 w-36 rounded-full" />
                            <Skeleton className="h-3 w-24 rounded-full" />
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    );
}
