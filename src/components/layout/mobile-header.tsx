import { Ellipsis } from "lucide-react";
import { AccountMenu } from "@/features/auth/components/user-menu-dropdown";
import { Logo } from "./logo";
import { MobileMenuDrawer } from "./mobile-menu-drawer";
import { SidebarContent } from "./sidebar";

const iconButtonClassName =
    "rounded-full p-2 text-foreground transition-colors transform-none hover:bg-default aria-expanded:bg-default";

// Top bar, only shown below the md breakpoint, like the bottom navigation.
// Stays below the iOS status bar.
export default function MobileHeader() {
    return (
        <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-default bg-surface px-4 sm:px-6 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 md:hidden">
            <MobileMenuDrawer
                triggerClassName={`justify-self-start ${iconButtonClassName}`}
            >
                <SidebarContent expanded />
            </MobileMenuDrawer>
            <Logo size="small" />
            <AccountMenu
                label="Account menu"
                triggerClassName={`justify-self-end ${iconButtonClassName}`}
                placement="bottom end"
            >
                <Ellipsis className="size-6" aria-hidden />
            </AccountMenu>
        </header>
    );
}
