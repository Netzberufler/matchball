import { Skeleton } from "@heroui/react";
import { requireSession } from "@/features/auth/lib/session";
import { isFollowing } from "@/features/follows/lib/queries";
import { getProfileUser } from "@/features/profile/lib/queries";
import { FollowButton } from "./follow-button";

// The Follow button on a profile page; nothing on the viewer's own profile.
// Reads the session and the database at request time, so render it inside
// <Suspense> with <ProfileFollowButtonFallback />.
export async function ProfileFollowButton({ username }: { username: string }) {
    const [{ user: viewer }, profileUser] = await Promise.all([
        requireSession(),
        getProfileUser(username),
    ]);
    // ProfileHeader shows the not-found page for unknown users
    if (!profileUser || profileUser.id === viewer.id) {
        return null;
    }

    return (
        <FollowButton
            // Start from the server's state when going to another profile
            key={profileUser.id}
            userId={profileUser.id}
            name={profileUser.name}
            initialIsFollowing={await isFollowing(viewer.id, profileUser.id)}
        />
    );
}

// Shown while the profile loads; the size of the button
export function ProfileFollowButtonFallback() {
    return <Skeleton className="h-10 w-24 rounded-full md:h-9" aria-hidden />;
}
