"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

// Both states are rendered and switched with the dark: variant, so the
// server-rendered button already matches the theme and doesn't flash.
export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-xs font-medium tracking-tight text-foreground transition-colors lg:flex-row lg:gap-3 lg:px-4 lg:text-lg lg:tracking-normal w-full cursor-pointer hover:bg-default"
        >
            <span className="contents dark:hidden">
                <Moon className="size-5 shrink-0" aria-hidden />
                Dark Mode
            </span>
            <span className="hidden dark:contents">
                <Sun className="size-5 shrink-0" aria-hidden />
                Light Mode
            </span>
        </button>
    );
}
