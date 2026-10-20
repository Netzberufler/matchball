"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { ToggleButton, ToggleButtonGroup } from "@heroui/react";

const themes = [
    { id: "light", label: "Light mode", icon: Sun },
    { id: "dark", label: "Dark mode", icon: Moon },
    { id: "system", label: "System preference", icon: Monitor },
] as const;

// The chosen theme is stored in the browser, so it's only known after
// hydration; until then no button is selected
const subscribe = () => () => {};
const useIsClient = () =>
    useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );

// A row of three icon buttons; className adjusts the layout, e.g. stacking
export function ThemeToggle({ className = "" }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const isClient = useIsClient();

    return (
        <ToggleButtonGroup
            aria-label="Theme"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={isClient && theme ? [theme] : []}
            onSelectionChange={(keys) => {
                const [selected] = keys;
                if (selected) {
                    setTheme(String(selected));
                }
            }}
            isDetached
            size="sm"
            className={`flex ${className}`}
        >
            {themes.map(({ id, label, icon: Icon }) => (
                <ToggleButton
                    key={id}
                    id={id}
                    aria-label={label}
                    variant="ghost"
                    isIconOnly
                    // Selected: the default background, like the active nav
                    // link, and unchanged on hover and press
                    className="[--toggle-button-bg-selected:var(--default)] [--toggle-button-bg-selected-hover:var(--default)] [--toggle-button-bg-selected-pressed:var(--default)] [--toggle-button-fg-selected:var(--foreground)] [--toggle-button-fg:var(--muted)] data-[selected=true]:transform-none data-[selected=true]:cursor-default"
                >
                    <Icon className="size-4" aria-hidden />
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}
