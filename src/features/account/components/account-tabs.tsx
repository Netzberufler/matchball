"use client";

import { useRouter } from "next/navigation";
import { RouterProvider, Tabs } from "@heroui/react";
import {
    ACCOUNT_PROFILE_PATH,
    ACCOUNT_SETTINGS_PATH,
} from "@/features/account/utils/account-path";

const ACCOUNT_TABS = [
    { key: "profile", label: "Edit profile", href: ACCOUNT_PROFILE_PATH },
    {
        key: "settings",
        label: "Account Settings",
        href: ACCOUNT_SETTINGS_PATH,
    },
] as const;

type AccountTab = (typeof ACCOUNT_TABS)[number]["key"];

// Links between the account pages, styled as tabs; `selected` is the
// current page's
export function AccountTabs({ selected }: { selected: AccountTab }) {
    const router = useRouter();

    return (
        // Tabs with an href are links; this makes them navigate like
        // next/link, without reloading the page
        <RouterProvider navigate={router.push}>
            <Tabs selectedKey={selected}>
                {/* Only as wide as the tabs, at the start; scrolls when the
                    screen is narrower */}
                <Tabs.ListContainer className="w-fit max-w-full self-start">
                    <Tabs.List aria-label="Account">
                        {ACCOUNT_TABS.map(({ key, label, href }) => (
                            <Tabs.Tab
                                key={key}
                                id={key}
                                href={href}
                                // Labels stay on one line; the list scrolls
                                // instead when the screen is too narrow
                                className="whitespace-nowrap"
                            >
                                {label}
                                {/* Without the sliding animation, which can
                                    leave it off its tab when the page
                                    appears */}
                                <Tabs.Indicator className="transition-none" />
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                </Tabs.ListContainer>
            </Tabs>
        </RouterProvider>
    );
}
