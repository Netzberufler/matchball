import { requireSession } from "@/features/auth/lib/session";
import {
    UserAvatar,
    UserMenuDropdown,
} from "@/features/auth/components/user-menu-dropdown";

// Reads the session, so it must be rendered inside <Suspense>
export async function UserMenu() {
    const { user } = await requireSession();
    // username is required in the database; Better Auth types it as optional
    return (
        <UserMenuDropdown
            name={user.name}
            username={user.username ?? ""}
            image={user.image}
        />
    );
}

// Shown while the session loads; same size as the menu, so nothing jumps
export function UserMenuFallback() {
    return (
        <div className="mx-auto flex w-fit items-center gap-3 lg:mx-0 lg:w-full lg:px-2 lg:py-2">
            <UserAvatar />
            <div className="hidden flex-col gap-1.5 lg:flex">
                <div className="h-3.5 w-28 rounded-full bg-default" />
                <div className="h-3 w-20 rounded-full bg-default" />
            </div>
        </div>
    );
}
