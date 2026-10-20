"use client";

import { useTransition } from "react";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { Avatar, Dropdown, Label } from "@heroui/react";
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
    const [, startTransition] = useTransition();

    return (
        <Dropdown>
            <Dropdown.Trigger
                aria-label={`Account menu for ${name}`}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-default p-1 text-left transition-colors hover:bg-default-hover lg:justify-start lg:px-2 lg:py-2"
            >
                <UserAvatar image={image} />
                {/* Only the avatar in the narrow tablet sidebar */}
                <span className="hidden min-w-0 flex-col lg:flex">
                    <span className="truncate font-medium text-foreground">
                        {name}
                    </span>
                    <span className="truncate text-sm text-muted">
                        @{username}
                    </span>
                </span>
            </Dropdown.Trigger>
            <Dropdown.Popover placement="top start">
                <Dropdown.Menu
                    onAction={(key) => {
                        if (key === "sign-out") {
                            startTransition(() => signOut());
                        }
                    }}
                >
                    <Dropdown.Item id="sign-out" textValue="Sign out">
                        <div className="flex w-full items-center justify-between gap-2">
                            <Label>Sign out</Label>
                            <LogOut className="size-4 text-muted" aria-hidden />
                        </div>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}

// The user's picture (e.g. from Google), or the default avatar when there is
// none, while it loads, or if it fails. alt is empty because the menu button
// already names the user.
export function UserAvatar({ image }: { image?: string | null }) {
    return (
        <Avatar className="shrink-0">
            {image && <Avatar.Image alt="" src={image} />}
            <Avatar.Fallback>
                <Image
                    alt=""
                    src="/default-avatar.jpg"
                    width={40}
                    height={40}
                    className="size-full object-cover"
                />
            </Avatar.Fallback>
        </Avatar>
    );
}
