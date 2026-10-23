import { notFound } from "next/navigation";
import { Skeleton } from "@heroui/react";
import { BackButton } from "@/components/ui/back-button";
import { requireSession } from "@/features/auth/lib/session";
import { getFollowListPage } from "@/features/follows/lib/queries";
import type { FollowListKind } from "@/features/follows/utils/follow-list";
import { getProfileUser } from "@/features/profile/lib/queries";
import { profilePath } from "@/features/profile/utils/profile-path";
import { FollowList, FollowListFallback } from "./follow-list";

// Thousands separated by dots, like the profile header's counts
const countFormat = new Intl.NumberFormat("de-DE");

// The body of the followers and following pages: back to the profile, the
// user's name, the count, and the list. A 404 for unknown users. Reads the
// session and the database at request time, so render it inside
// <Suspense> with <FollowListPageFallback />.
export async function FollowListPage({
    kind,
    username,
}: {
    kind: FollowListKind;
    username: string;
}) {
    const [, user] = await Promise.all([
        requireSession(),
        getProfileUser(username),
    ]);
    if (!user) {
        notFound();
    }
    const firstPage = await getFollowListPage(kind, user.id);

    const count =
        kind === "followers" ? user._count.followers : user._count.following;
    const countLabel =
        kind === "followers"
            ? count === 1
                ? "Follower"
                : "Followers"
            : "Following";

    return (
        <>
            <div className="mb-4">
                <div className="flex items-center gap-2">
                    <BackButton fallbackHref={profilePath(user.username)} />
                    <h1 className="truncate text-xl font-semibold">
                        {user.name}
                    </h1>
                </div>
                {/* Lined up with the name, after the back button */}
                <p className="ml-10 text-sm text-muted">
                    {countFormat.format(count)} {countLabel}
                </p>
            </div>
            <FollowList
                kind={kind}
                userId={user.id}
                firstPage={firstPage}
                emptyMessage={
                    kind === "followers"
                        ? `Nobody follows @${user.username} yet.`
                        : `@${user.username} doesn't follow anyone yet.`
                }
            />
        </>
    );
}

// Shown while the page loads; the shape of FollowListPage
export function FollowListPageFallback() {
    return (
        <>
            <div className="mb-4 flex flex-col gap-2" aria-hidden>
                <div className="flex items-center gap-2">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="h-6 w-48 rounded-full" />
                </div>
                <Skeleton className="ml-10 h-3.5 w-24 rounded-full" />
            </div>
            <FollowListFallback />
        </>
    );
}
