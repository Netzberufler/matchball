import { Button, Skeleton } from "@heroui/react";
import { requireSession } from "@/features/auth/lib/session";
import { FollowButton } from "@/features/follows/components/follow-button";
import { isFollowing } from "@/features/follows/lib/queries";
import { getProfileUser } from "@/features/profile/lib/queries";

// The buttons below a profile header, in one line that shares the full width
// equally, however many buttons there are. Not shown on the viewer's own
// profile. Reads the session and the database at request time, so render it
// inside <Suspense> with <ProfileActionsFallback />.
export async function ProfileActions({ username }: { username: string }) {
    const [{ user: viewer }, profileUser] = await Promise.all([
        requireSession(),
        getProfileUser(username),
    ]);
    // ProfileHeader shows the not-found page for unknown users
    if (!profileUser || profileUser.id === viewer.id) {
        return null;
    }

    return (
        <ButtonLine>
            <FollowButton
                // Start from the server's state when going to another profile
                key={profileUser.id}
                userId={profileUser.id}
                name={profileUser.name}
                initialIsFollowing={await isFollowing(
                    viewer.id,
                    profileUser.id,
                )}
            />
            {/* TODO: challenge the user to a match */}
            <Button variant="tertiary" fullWidth>
                Challenge
            </Button>
        </ButtonLine>
    );
}

// Each child gets an equal share of the width
function ButtonLine({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid auto-cols-fr grid-flow-col items-start gap-3">
            {children}
        </div>
    );
}

// Shown while the profile loads; the size of the button line
export function ProfileActionsFallback() {
    return (
        <div aria-hidden>
            <ButtonLine>
                <Skeleton className="h-10 rounded-full md:h-9" />
                <Skeleton className="h-10 rounded-full md:h-9" />
            </ButtonLine>
        </div>
    );
}
