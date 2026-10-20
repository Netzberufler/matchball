"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs } from "@heroui/react";

const tabs = [
    { href: "/sign-in", label: "Sign in" },
    { href: "/sign-up", label: "Sign up" },
] as const;

// Switches between the sign-in and sign-up pages
export function AuthTabs() {
    const pathname = usePathname();

    return (
        <Tabs className="self-start" selectedKey={pathname}>
            <Tabs.ListContainer>
                <Tabs.List aria-label="Sign in or sign up">
                    {tabs.map(({ href, label }) => (
                        <Tabs.Tab
                            key={href}
                            id={href}
                            href={href}
                            className="whitespace-nowrap"
                            // Client-side navigation with the Next.js router
                            render={(domProps) => (
                                <Link {...(domProps as LinkProps)} />
                            )}
                        >
                            {label}
                            <Tabs.Indicator className="transition-none" />
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
            </Tabs.ListContainer>
        </Tabs>
    );
}

type LinkProps = React.ComponentProps<typeof Link>;
