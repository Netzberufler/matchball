"use client";

import { type ComponentProps, type ReactNode, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Ellipsis, LogOut, Moon, Settings, Sun } from "lucide-react";
import { Dropdown, Label } from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ACCOUNT_SETTINGS_PATH } from "@/features/account/utils/account-path";
import { signOut } from "@/features/auth/actions/sign-out";

// expanded: always show the name, e.g. in the mobile menu drawer; otherwise
// only the avatar below lg, for the narrow tablet sidebar
export function UserMenuDropdown({
    name,
    username,
    image,
    expanded = false,
}: {
    name: string;
    username: string;
    image?: string | null;
    expanded?: boolean;
}) {
    return (
        <AccountMenu
            label={`Account menu for ${name}`}
            triggerClassName={`flex items-center gap-3 rounded-full text-left transition-colors transform-none hover:bg-default aria-expanded:bg-default ${
                expanded
                    ? "w-full px-2 py-2"
                    : "mx-auto w-fit lg:mx-0 lg:w-full lg:px-2 lg:py-2"
            }`}
            placement="top start"
        >
            <UserAvatar name={name} image={image} />
            <span
                className={`min-w-0 flex-col ${expanded ? "flex" : "hidden lg:flex"}`}
            >
                <span className="truncate font-medium text-foreground">
                    {name}
                </span>
                <span className="truncate text-sm text-muted">@{username}</span>
            </span>
            <Ellipsis
                className={`ml-auto size-5 shrink-0 text-muted ${
                    expanded ? "block" : "hidden lg:block"
                }`}
                aria-hidden
            />
        </AccountMenu>
    );
}

// The theme, settings and sign-out menu, opened by the given trigger content
// (children). Needs no session, so it can render without <Suspense>.
export function AccountMenu({
    label,
    triggerClassName,
    placement,
    children,
}: {
    label: string;
    triggerClassName: string;
    placement: ComponentProps<typeof Dropdown.Popover>["placement"];
    children: ReactNode;
}) {
    const router = useRouter();
    const [, startTransition] = useTransition();
    const { resolvedTheme, setTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const ThemeIcon = isDark ? Sun : Moon;
    const themeLabel = isDark ? "Use light mode" : "Use dark mode";

    return (
        <Dropdown>
            <Dropdown.Trigger aria-label={label} className={triggerClassName}>
                {children}
            </Dropdown.Trigger>
            <Dropdown.Popover placement={placement}>
                <Dropdown.Menu
                    onAction={(key) => {
                        if (key === "theme") {
                            setTheme(isDark ? "light" : "dark");
                        } else if (key === "settings") {
                            router.push(ACCOUNT_SETTINGS_PATH);
                        } else if (key === "sign-out") {
                            startTransition(() => signOut());
                        }
                    }}
                >
                    <Dropdown.Item id="theme" textValue={themeLabel}>
                        <div className="flex w-full items-center gap-2">
                            <ThemeIcon
                                className="size-4 text-muted"
                                aria-hidden
                            />
                            <Label>{themeLabel}</Label>
                        </div>
                    </Dropdown.Item>
                    <Dropdown.Item id="settings" textValue="Settings">
                        <div className="flex w-full items-center gap-2">
                            <Settings
                                className="size-4 text-muted"
                                aria-hidden
                            />
                            <Label>Settings</Label>
                        </div>
                    </Dropdown.Item>
                    <Dropdown.Item id="sign-out" textValue="Sign out">
                        <div className="flex w-full items-center gap-2">
                            <LogOut className="size-4 text-muted" aria-hidden />
                            <Label>Sign out</Label>
                        </div>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}
