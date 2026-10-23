import { Suspense } from "react";
import type { Metadata } from "next";
import {
    FollowListPage,
    FollowListPageFallback,
} from "@/features/follows/components/follow-list-page";
import { getProfileUser } from "@/features/profile/lib/queries";

export async function generateMetadata({
    params,
}: PageProps<"/profile/[username]/followers">): Promise<Metadata> {
    const { username } = await params;
    const user = await getProfileUser(username);
    return {
        title: user
            ? `People following ${user.name} (@${user.username})`
            : "Profile not found",
    };
}

// Who follows the user. The params are only known at request time, so
// everything that reads them is inside <Suspense>.
export default function FollowersPage({
    params,
}: PageProps<"/profile/[username]/followers">) {
    return (
        <Suspense fallback={<FollowListPageFallback />}>
            {params.then(({ username }) => (
                <FollowListPage kind="followers" username={username} />
            ))}
        </Suspense>
    );
}
