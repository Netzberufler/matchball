import { notFound } from "next/navigation";
import { ViewerProvider } from "@/features/auth/components/viewer-provider";
import { requireSession } from "@/features/auth/lib/session";
import { getFeedPage } from "@/features/posts/lib/queries";
import { getProfileUser } from "@/features/profile/lib/queries";
import { PostFeed } from "./post-feed";

// These read the session and the database at request time, so render them
// inside <Suspense> with <PostListFallback />. They load the first page;
// PostFeed loads the rest. ViewerProvider gives the posts' reply forms the
// signed-in user, for their avatar.

export async function HomeFeed() {
    const { user } = await requireSession();
    const feed = { type: "home" } as const;
    const firstPage = await getFeedPage(feed, user.id);
    return (
        <ViewerProvider viewer={{ name: user.name, image: user.image }}>
            <PostFeed
                feed={feed}
                firstPage={firstPage}
                emptyMessage="No posts yet. Follow people to see their posts here."
            />
        </ViewerProvider>
    );
}

// One user's posts, for their profile page; a 404 if there's no such user
export async function ProfileFeed({ username }: { username: string }) {
    const [{ user: viewer }, profileUser] = await Promise.all([
        requireSession(),
        getProfileUser(username),
    ]);
    if (!profileUser) {
        notFound();
    }

    const feed = { type: "user", authorId: profileUser.id } as const;
    const firstPage = await getFeedPage(feed, viewer.id);
    return (
        <ViewerProvider viewer={{ name: viewer.name, image: viewer.image }}>
            <PostFeed
                // Start over when going from one profile to another
                key={profileUser.id}
                feed={feed}
                firstPage={firstPage}
                emptyMessage={
                    profileUser.id === viewer.id
                        ? "You haven't posted anything yet."
                        : `@${profileUser.username} hasn't posted anything yet.`
                }
            />
        </ViewerProvider>
    );
}
