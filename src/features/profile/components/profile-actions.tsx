import Link from "next/link";
import { Button, buttonVariants, Skeleton } from "@heroui/react";
import { MessagesSquare, Sword } from "lucide-react";
import { ACCOUNT_PROFILE_PATH } from "@/features/account/utils/account-path";
import { requireSession } from "@/features/auth/lib/session";
import { FollowButton } from "@/features/follows/components/follow-button";
import { isFollowing } from "@/features/follows/lib/queries";
import { conversationPath } from "@/features/messages/utils/messages-path";
import { getProfileUser } from "@/features/profile/lib/queries";

// The buttons below a profile header, in one line that shares the full width
// equally, however many buttons there are. The viewer's own profile gets
// its own buttons. Reads the session and the database at request time, so
// render it inside <Suspense> with <ProfileActionsFallback />.
export async function ProfileActions({ username }: { username: string }) {
    const [{ user: viewer }, profileUser] = await Promise.all([
        requireSession(),
        getProfileUser(username),
    ]);
    // ProfileHeader shows the not-found page for unknown users
    if (!profileUser) {
        return null;
    }

    if (profileUser.id === viewer.id) {
        return (
            <ButtonLine>
                {/* A link styled as a HeroUI button */}
                <Link
                    href={ACCOUNT_PROFILE_PATH}
                    className={buttonVariants({
                        variant: "tertiary",
                        fullWidth: true,
                    })}
                >
                    Edit profile
                </Link>
            </ButtonLine>
        );
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
            <Button variant="primary" fullWidth>
                <Sword className="size-4" aria-hidden />
                Challenge
            </Button>
            {/* The conversation with them, new if they haven't talked yet;
                a link styled as a HeroUI button */}
            <Link
                href={conversationPath(profileUser.username)}
                className={buttonVariants({
                    variant: "primary",
                    fullWidth: true,
                })}
            >
                <MessagesSquare className="size-4" aria-hidden />
                Message
            </Link>
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
                <Skeleton className="h-10 rounded-full md:h-9" />
            </ButtonLine>
        </div>
    );
}
