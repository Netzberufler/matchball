import Link from "next/link";

// Tennis ball mark, filled with the theme's accent color
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
                className="stroke-accent-foreground"
            >
                <path d="M6.2 4.6a15 15 0 0 1 0 22.8" />
                <path d="M25.8 4.6a15 15 0 0 0 0 22.8" />
            </g>
        </svg>
    );
}

export function Logo() {
    return (
        <Link
            href="/"
            aria-label="Matchball home"
            className="flex items-center gap-3 rounded-2xl px-2"
        >
            <BallMark className="size-8 shrink-0" />
            <span className="text-2xl font-semibold tracking-tight text-foreground">
                myMatchball
            </span>
        </Link>
    );
}
