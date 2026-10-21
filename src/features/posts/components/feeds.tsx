import { requireSession } from "@/features/auth/lib/session";
import { getFeedPage } from "@/features/posts/lib/queries";
import { PostFeed } from "./post-feed";

// These read the session and the database at request time, so render them
// inside <Suspense> with <PostListFallback />. They load the first page;
// PostFeed loads the rest.

export async function HomeFeed() {
    const { user } = await requireSession();
    const firstPage = await getFeedPage("home", user.id);
    return (
        <PostFeed
            feed="home"
            firstPage={firstPage}
            emptyMessage="No posts yet. Be the first!"
        />
    );
}

// The signed-in user's own posts, for the profile page
export async function ProfileFeed() {
    const { user } = await requireSession();
    const firstPage = await getFeedPage("profile", user.id);
    return (
        <PostFeed
            feed="profile"
            firstPage={firstPage}
            emptyMessage="You haven't posted anything yet."
        />
    );
}
