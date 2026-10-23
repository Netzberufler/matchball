import { UserAvatar } from "@/components/ui/user-avatar";
import { requireSession } from "@/features/auth/lib/session";

// The signed-in user's avatar. Reads the session, so render it inside
// <Suspense> with <UserAvatar /> (an empty circle) as the fallback.
export async function ViewerAvatar() {
    const { user } = await requireSession();
    return <UserAvatar name={user.name} image={user.image} />;
}
