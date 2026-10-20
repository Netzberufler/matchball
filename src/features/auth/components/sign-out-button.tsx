import { LogOut } from "lucide-react";
import { signOut } from "@/features/auth/actions/sign-out";

// A form, so signing out works without client-side JavaScript
export function SignOutButton() {
    return (
        <form action={signOut}>
            <button
                type="submit"
                className="flex flex-col items-center gap-1 rounded-full px-1 py-2 text-xs font-medium tracking-tight text-foreground transition-colors lg:flex-row lg:gap-3 lg:px-4 lg:text-sm lg:tracking-normal w-full cursor-pointer hover:bg-default"
            >
                <LogOut className="size-4 shrink-0" aria-hidden />
                Sign out
            </button>
        </form>
    );
}
