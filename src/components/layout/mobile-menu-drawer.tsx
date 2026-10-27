"use client";

import { type ReactNode, Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Drawer } from "@heroui/react";

// Opens the sidebar content (children) in a drawer from the left. Closes when
// a link inside is clicked or the page changes (e.g. via the user menu).
export function MobileMenuDrawer({
    triggerClassName,
    children,
}: {
    triggerClassName: string;
    children: ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Drawer isOpen={isOpen} onOpenChange={setIsOpen}>
            <Drawer.Trigger aria-label="Open menu" className={triggerClassName}>
                <Menu className="size-6" aria-hidden />
            </Drawer.Trigger>
            <Drawer.Backdrop>
                <Drawer.Content placement="left">
                    <Drawer.Dialog aria-label="Menu">
                        <Drawer.CloseTrigger />
                        <Drawer.Body
                            className="flex h-full flex-col"
                            onClick={(event) => {
                                if ((event.target as Element).closest("a")) {
                                    setIsOpen(false);
                                }
                            }}
                        >
                            {children}
                        </Drawer.Body>
                    </Drawer.Dialog>
                </Drawer.Content>
            </Drawer.Backdrop>
            {/* usePathname may suspend during prerendering */}
            <Suspense fallback={null}>
                <CloseOnNavigation onNavigate={() => setIsOpen(false)} />
            </Suspense>
        </Drawer>
    );
}

function CloseOnNavigation({ onNavigate }: { onNavigate: () => void }) {
    const pathname = usePathname();
    // Only the pathname should trigger this, not a new onNavigate function
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => onNavigate(), [pathname]);
    return null;
}
