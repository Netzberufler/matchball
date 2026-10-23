import { Suspense } from "react";
import type { Metadata } from "next";
import {
    FollowListPage,
    FollowListPageFallback,
} from "@/features/follows/components/follow-list-page";
import { getProfileUser } from "@/features/profile/lib/queries";

export async function generateMetadata({
    params,
}: PageProps<"/profile/[username]/follows">): Promise<Metadata> {
    const { username } = await params;
    const user = await getProfileUser(username);
    return {
        title: user
            ? `People followed by ${user.name} (@${user.username})`
            : "Profile not found",
    };
}

// Whom the user follows. The params are only known at request time, so
// everything that reads them is inside <Suspense>.
export default function FollowingPage({
    params,
}: PageProps<"/profile/[username]/follows">) {
    return (
        <Suspense fallback={<FollowListPageFallback />}>
            {params.then(({ username }) => (
                <FollowListPage kind="following" username={username} />
            ))}
        </Suspense>
    );
}
