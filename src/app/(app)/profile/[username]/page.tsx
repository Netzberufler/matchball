import { Suspense } from "react";
import type { Metadata } from "next";
import { BackButton } from "@/components/ui/back-button";
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
// is inside <Suspense>. The header and the feed share one user lookup.
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
                        <LatestPosts>
                            <PostListFallback />
                        </LatestPosts>
                    </>
                }
            >
                {params.then(({ username }) => (
                    <>
                        <ProfileHeader username={username} />
                        <ProfileActions username={username} />
                        <LatestPosts>
                            <ProfileFeed username={username} />
                        </LatestPosts>
                    </>
                ))}
            </Suspense>
        </div>
    );
}

// The posts below the header, with their heading
function LatestPosts({ children }: { children: React.ReactNode }) {
    return (
        <section aria-labelledby="latest-posts-heading">
            <h2
                id="latest-posts-heading"
                className="text-lg mb-3 font-semibold"
            >
                Latest posts
            </h2>
            {children}
        </section>
    );
}
