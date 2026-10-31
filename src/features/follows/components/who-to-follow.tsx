import { Card, EmptyState } from "@heroui/react";
import { requireSession } from "@/features/auth/lib/session";
import { FollowButton } from "@/features/follows/components/follow-button";
import { getSuggestedUsers } from "@/features/follows/lib/queries";
import { UserList } from "@/features/profile/components/user-list";

// People the viewer might want to follow, for the Explore page: those with
// the most followers among the people they don't follow yet, each with a
// Follow button. Following someone refreshes the page, so they leave the
// list and the next suggestion comes up. Reads the session and the database at request time, so render it
// inside <Suspense> with <UserListFallback />.
export async function WhoToFollow() {
    const { user: viewer } = await requireSession();
    const users = await getSuggestedUsers(viewer.id);

    if (users.length === 0) {
        return (
            <Card>
                <EmptyState className="text-center">
                    No suggestions right now. You already follow everyone.
                </EmptyState>
            </Card>
        );
    }

    return (
        <UserList
            users={users}
            action={(user) => (
                // As wide as the button with its longer label, Unfollow
                <div className="w-28">
                    <FollowButton
                        userId={user.id}
                        name={user.name}
                        isFollowing={false}
                    />
                </div>
            )}
        />
    );
}
