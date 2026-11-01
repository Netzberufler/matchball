import Link from "next/link";
import { Wordmark } from "./wordmark";

// Tennis ball mark, filled with the theme's accent color. The seams use the
// page background color, so they read as cut-outs in light and dark mode.
function BallMark({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 32 32"
            className={className}
            aria-hidden
            focusable="false"
        >
            <circle cx="16" cy="16" r="15" className="fill-accent" />
            <g
                fill="none"
                strokeWidth="2.25"
                strokeLinecap="round"
                transform="rotate(-45 16 16)"
                className="stroke-background"
            >
                <path d="M6.2 4.6a15 15 0 0 1 0 22.8" />
                <path d="M25.8 4.6a15 15 0 0 0 0 22.8" />
            </g>
        </svg>
    );
}

// The logo's font size: the wordmark is sized in em of it
const sizes = {
    small: "text-2xl",
    default: "text-[2rem]",
    large: "text-[2.5rem]",
};

// compact: only the ball below lg, for the narrow tablet sidebar
export function Logo({
    compact = false,
    size = "default",
}: {
    compact?: boolean;
    size?: keyof typeof sizes;
}) {
    return (
        <Link
            href="/"
            aria-label="Matchball home"
            className={`flex items-center rounded-2xl ${sizes[size]} ${
                compact ? "justify-center lg:justify-start lg:px-2" : ""
            }`}
        >
            {compact && <BallMark className="size-8 shrink-0 lg:hidden" />}
            <Wordmark
                className={`h-[0.957em] w-auto shrink-0 ${
                    compact ? "hidden lg:block" : ""
                }`}
            />
        </Link>
    );
}
