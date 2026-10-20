import { requireSession } from "@/features/auth/lib/session";
import { getHomeFeedPosts, getUserPosts } from "@/features/posts/lib/queries";
import { PostList } from "./post-list";

// These read the session and the database at request time, so render them
// inside <Suspense> with <PostListFallback />

export async function HomeFeed() {
    await requireSession();
    const posts = await getHomeFeedPosts();
    return (
        <PostList posts={posts} emptyMessage="No posts yet. Be the first!" />
    );
}

// The signed-in user's own posts, for the profile page
export async function ProfileFeed() {
    const { user } = await requireSession();
    const posts = await getUserPosts(user.id);
    return (
        <PostList
            posts={posts}
            emptyMessage="You haven't posted anything yet."
        />
    );
}
