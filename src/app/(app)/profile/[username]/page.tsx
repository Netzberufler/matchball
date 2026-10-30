import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { requireSession } from "@/features/auth/lib/session";
import { ProfileFeed } from "@/features/posts/components/feeds";
import { PostListFallback } from "@/features/posts/components/post-list";
import {
    ProfileActions,
    ProfileActionsFallback,
} from "@/features/profile/components/profile-actions";
import {
    ProfileHeader,
    ProfileHeaderFallback,
} from "@/features/profile/components/profile-header";
import { addMatchPath } from "@/features/matches/utils/match-path";
import { ProfileTabs } from "@/features/profile/components/profile-tabs";
import { getProfileUser } from "@/features/profile/lib/queries";

export async function generateMetadata({
    params,
}: PageProps<"/profile/[username]">): Promise<Metadata> {
    const { username } = await params;
    const user = await getProfileUser(username);
    return {
        title: user ? `${user.name} (@${user.username})` : "Profile not found",
    };
}

// The params are only known at request time, so everything that reads them
// is inside <Suspense>. The header, the tabs and the feed share one user
// lookup.
export default function ProfilePage({
    params,
}: PageProps<"/profile/[username]">) {
    return (
        <div className="flex flex-col gap-6">
            {/* Outside <Suspense>, so it shows right away; -mb-2 keeps it
                close to the header */}
            <div className="-mb-2 flex items-center gap-2">
                <BackButton />
                {/* A label, not a heading: the user's name is the page's
                    h1 */}
                <p className="text-xl font-semibold">Profile</p>
            </div>
            <Suspense
                fallback={
                    <>
                        <ProfileHeaderFallback />
                        <ProfileActionsFallback />
                        <ProfileTabs
                            posts={<PostListFallback />}
                            matchesUser={null}
                        />
                    </>
                }
            >
                {params.then(({ username }) => (
                    <>
                        <ProfileHeader username={username} />
                        <ProfileActions username={username} />
                        <ProfileContent username={username} />
                    </>
                ))}
            </Suspense>
        </div>
    );
}

// The user's posts and matches below the header, in tabs; a 404 if there's
// no such user
async function ProfileContent({ username }: { username: string }) {
    const [{ user: viewer }, user] = await Promise.all([
        requireSession(),
        getProfileUser(username),
    ]);
    if (!user) {
        notFound();
    }
    const isOwn = user.id === viewer.id;
    return (
        <ProfileTabs
            // Start over when going from one profile to another
            key={user.id}
            posts={<ProfileFeed username={username} />}
            matchesUser={{
                id: user.id,
                addMatchHref: isOwn
                    ? addMatchPath()
                    : addMatchPath(user.username),
                label: isOwn ? "Your matches" : `@${user.username}'s matches`,
                emptyMessage: isOwn
                    ? "You haven't played any matches yet."
                    : `@${user.username} hasn't played any matches yet.`,
            }}
        />
    );
}
