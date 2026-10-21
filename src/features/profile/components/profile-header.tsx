import { notFound } from "next/navigation";
import { Skeleton } from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getProfileUser } from "@/features/profile/lib/queries";

// The top of a profile page: avatar, name and username, laid out like the
// user menu in the sidebar. Reads the database at request time, so render
// it inside <Suspense> with <ProfileHeaderFallback />.
export async function ProfileHeader({ username }: { username: string }) {
    const user = await getProfileUser(username);
    if (!user) {
        notFound();
    }

    return (
        <div className="flex items-center gap-4">
            <UserAvatar name={user.name} image={user.image} size="xl" />
            <div className="min-w-0">
                {/* The page's main heading */}
                <h1 className="truncate text-xl font-semibold sm:text-2xl">
                    {user.name}
                </h1>
                <p className="truncate text-muted">@{user.username}</p>
            </div>
        </div>
    );
}

// Shown while the profile loads; same size as the header, so nothing jumps
export function ProfileHeaderFallback() {
    return (
        <div className="flex items-center gap-4" aria-hidden>
            <Skeleton className="size-16 shrink-0 rounded-full sm:size-20" />
            <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-48 rounded-full" />
                <Skeleton className="h-4 w-28 rounded-full" />
            </div>
        </div>
    );
}
