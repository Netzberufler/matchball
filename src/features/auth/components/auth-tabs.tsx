"use client";

import { useState } from "react";
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
    const [clicked, setClicked] = useState({ from: pathname, to: pathname });
    const selectedKey = clicked.from === pathname ? clicked.to : pathname;

    return (
        <Tabs
            className="self-start"
            selectedKey={selectedKey}
            onSelectionChange={(key) =>
                setClicked({ from: pathname, to: String(key) })
            }
        >
            <Tabs.ListContainer>
                <Tabs.List aria-label="Sign in or sign up">
                    {tabs.map(({ href, label }) => (
                        <Tabs.Tab
                            key={href}
                            id={href}
                            href={href}
                            className="whitespace-nowrap"
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
