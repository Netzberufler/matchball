import { Skeleton } from "@heroui/react";
import { requireSession } from "@/features/auth/lib/session";
import { ProfileForm } from "@/features/account/components/profile-form";

// The profile form, filled in with the signed-in user's data. Reads the
// session, so render it inside <Suspense> with <EditProfileFallback />.
export async function EditProfile() {
    const { user } = await requireSession();
    return <ProfileForm name={user.name} />;
}

// Shown while the session loads; the size of the form
export function EditProfileFallback() {
    return (
        <div className="flex max-w-md flex-col gap-4" aria-hidden>
            <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-12 rounded-full" />
                <Skeleton className="h-10 rounded-xl md:h-9" />
                <Skeleton className="h-3 w-32 rounded-full" />
            </div>
            <Skeleton className="h-10 w-20 rounded-full md:h-9" />
        </div>
    );
}
