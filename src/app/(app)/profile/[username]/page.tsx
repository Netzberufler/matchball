import { Suspense } from "react";
import type { Metadata } from "next";
import { ProfileFeed } from "@/features/posts/components/feeds";
import { PostListFallback } from "@/features/posts/components/post-list";
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
// is inside <Suspense>
export default function ProfilePage({
    params,
}: PageProps<"/profile/[username]">) {
    return (
        <>
            <h1 className="text-xl mb-4 font-semibold">Profile</h1>
            <Suspense fallback={<PostListFallback />}>
                {params.then(({ username }) => (
                    <ProfileFeed username={username} />
                ))}
            </Suspense>
        </>
    );
}
