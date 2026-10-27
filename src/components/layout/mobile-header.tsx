import { Ellipsis, Menu } from "lucide-react";
import { AccountMenu } from "@/features/auth/components/user-menu-dropdown";
import { Logo } from "./logo";

const iconButtonClassName =
    "rounded-full p-2 text-foreground transition-colors hover:bg-default";

// Top bar, only shown below the md breakpoint, like the bottom navigation.
// Stays below the iOS status bar.
export default function MobileHeader() {
    return (
        <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-default bg-surface px-4 sm:px-6 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 md:hidden">
            {/* The menu itself comes later */}
            <button
                type="button"
                aria-label="Open menu"
                className={`justify-self-start ${iconButtonClassName}`}
            >
                <Menu className="size-6" aria-hidden />
            </button>
            <Logo size="small" />
            <AccountMenu
                label="Account menu"
                triggerClassName={`justify-self-end transform-none aria-expanded:bg-default ${iconButtonClassName}`}
                placement="bottom end"
            >
                <Ellipsis className="size-6" aria-hidden />
            </AccountMenu>
        </header>
    );
}
