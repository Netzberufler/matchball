import { Card, Skeleton } from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { requireSession } from "@/features/auth/lib/session";
import { ProfileForm } from "@/features/account/components/profile-form";

// The signed-in user's current profile above the profile form, which is
// filled in with their data. Reads the session, so render it inside
// <Suspense> with <EditProfileFallback />.
export async function EditProfile() {
    const { user } = await requireSession();
    // username is required in the database; Better Auth types it as optional
    const username = user.username ?? "";
    return (
        <ProfileForm name={user.name} username={username}>
            {/* Laid out like the user menu in the sidebar */}
            <div className="flex items-center gap-3 rounded-2xl bg-surface-secondary p-4">
                <UserAvatar name={user.name} image={user.image} />
                <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium text-foreground">
                        {user.name}
                    </span>
                    <span className="truncate text-sm text-muted">
                        @{username}
                    </span>
                </div>
            </div>
        </ProfileForm>
    );
}

// Shown while the session loads; the size of the card with the profile and
// the form
export function EditProfileFallback() {
    return (
        <Card aria-hidden>
            <Card.Content className="flex flex-col gap-6">
                <div className="flex items-center gap-3 rounded-2xl bg-surface-secondary p-4">
                    <UserAvatar />
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-3.5 w-28 rounded-full" />
                        <Skeleton className="h-3 w-20 rounded-full" />
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    {/* The username and name fields */}
                    {[0, 1].map((field) => (
                        <div key={field} className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-16 rounded-full" />
                            <Skeleton className="h-10 rounded-xl md:h-9" />
                            <Skeleton className="h-3 w-32 rounded-full" />
                        </div>
                    ))}
                    <Skeleton className="h-10 w-20 rounded-full md:h-9" />
                </div>
            </Card.Content>
        </Card>
    );
}
