import { requireSession } from "@/features/auth/lib/session";
import { UserAvatar } from "@/components/ui/user-avatar";
import { UserMenuDropdown } from "@/features/auth/components/user-menu-dropdown";

// Reads the session, so it must be rendered inside <Suspense>
// expanded: always show the name, e.g. in the mobile menu drawer
export async function UserMenu({ expanded = false }: { expanded?: boolean }) {
    const { user } = await requireSession();
    // username is required in the database; Better Auth types it as optional
    return (
        <UserMenuDropdown
            name={user.name}
            username={user.username ?? ""}
            image={user.image}
            expanded={expanded}
        />
    );
}

// Shown while the session loads; same size as the menu, so nothing jumps
export function UserMenuFallback({ expanded = false }: { expanded?: boolean }) {
    return (
        <div
            className={`flex items-center gap-3 ${
                expanded
                    ? "w-full px-2 py-2"
                    : "mx-auto w-fit lg:mx-0 lg:w-full lg:px-2 lg:py-2"
            }`}
        >
            <UserAvatar />
            <div
                className={`flex-col gap-1.5 ${expanded ? "flex" : "hidden lg:flex"}`}
            >
                <div className="h-3.5 w-28 rounded-full bg-default" />
                <div className="h-3 w-20 rounded-full bg-default" />
            </div>
        </div>
    );
}
