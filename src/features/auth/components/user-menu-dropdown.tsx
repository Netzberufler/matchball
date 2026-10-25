"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Ellipsis, LogOut, Moon, Settings, Sun } from "lucide-react";
import { Dropdown, Label } from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ACCOUNT_SETTINGS_PATH } from "@/features/account/utils/account-path";
import { signOut } from "@/features/auth/actions/sign-out";

export function UserMenuDropdown({
    name,
    username,
    image,
}: {
    name: string;
    username: string;
    image?: string | null;
}) {
    const router = useRouter();
    const [, startTransition] = useTransition();
    const { resolvedTheme, setTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const ThemeIcon = isDark ? Sun : Moon;
    const themeLabel = isDark ? "Use light mode" : "Use dark mode";

    return (
        <Dropdown>
            <Dropdown.Trigger
                aria-label={`Account menu for ${name}`}
                className="mx-auto flex w-fit items-center gap-3 rounded-full text-left transition-colors transform-none hover:bg-default aria-expanded:bg-default lg:mx-0 lg:w-full lg:px-2 lg:py-2"
            >
                <UserAvatar name={name} image={image} />
                {/* Only the avatar in the narrow tablet sidebar */}
                <span className="hidden min-w-0 flex-col lg:flex">
                    <span className="truncate font-medium text-foreground">
                        {name}
                    </span>
                    <span className="truncate text-sm text-muted">
                        @{username}
                    </span>
                </span>
                <Ellipsis
                    className="ml-auto hidden size-5 shrink-0 text-muted lg:block"
                    aria-hidden
                />
            </Dropdown.Trigger>
            <Dropdown.Popover placement="top start">
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
