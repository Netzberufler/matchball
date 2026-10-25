import Link from "next/link";
import { notFound } from "next/navigation";
import { Skeleton } from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getProfileUser } from "@/features/profile/lib/queries";
import {
    followersPath,
    followingPath,
} from "@/features/profile/utils/profile-path";

// Thousands separated by dots, e.g. "1.231"
const countFormat = new Intl.NumberFormat("de-DE");

// The top of a profile page: avatar with the name, username and counts
// beside it. Reads the database at request time, so render it inside
// <Suspense> with <ProfileHeaderFallback />.
export async function ProfileHeader({ username }: { username: string }) {
    const user = await getProfileUser(username);
    if (!user) {
        notFound();
    }
    const { posts, followers, following } = user._count;

    return (
        <div className="flex items-center gap-4 sm:gap-6">
            <UserAvatar name={user.name} image={user.image} size="xl" />
            <div className="min-w-0">
                {/* The page's main heading */}
                <h1 className="truncate text-xl font-semibold sm:text-2xl">
                    {user.name}
                </h1>
                <p className="truncate text-muted">@{user.username}</p>
                <p className="mt-1 flex flex-wrap gap-x-4 text-sm text-muted">
                    {/* The spaces separate the counts for screen readers and
                        copied text; gap-x does the visual spacing */}
                    <Count
                        value={posts}
                        label={posts === 1 ? "Post" : "Posts"}
                    />{" "}
                    <Count
                        value={followers}
                        label={followers === 1 ? "Follower" : "Followers"}
                        href={followersPath(user.username)}
                    />{" "}
                    <Count
                        value={following}
                        label="Following"
                        href={followingPath(user.username)}
                    />
                </p>
                {/* Keeps the user's line breaks; long words wrap rather
                    than widen the page */}
                {user.bio && (
                    <p className="mt-2 break-words whitespace-pre-line">
                        {user.bio}
                    </p>
                )}
            </div>
        </div>
    );
}

// A count with its label; with `href`, a link to the list behind it
function Count({
    value,
    label,
    href,
}: {
    value: number;
    label: string;
    href?: string;
}) {
    const content = (
        <>
            <span className="font-semibold text-foreground">
                {countFormat.format(value)}
            </span>{" "}
            {label}
        </>
    );
    return href ? (
        <Link href={href} className="hover:underline">
            {content}
        </Link>
    ) : (
        <span>{content}</span>
    );
}

// Shown while the profile loads; same size as the header, so nothing jumps
export function ProfileHeaderFallback() {
    return (
        <div className="flex items-center gap-4 sm:gap-6" aria-hidden>
            <Skeleton className="size-24 shrink-0 rounded-full sm:size-35" />
            <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-48 max-w-full rounded-full" />
                <Skeleton className="h-4 w-28 max-w-full rounded-full" />
                <Skeleton className="h-4 w-56 max-w-full rounded-full" />
            </div>
        </div>
    );
}
