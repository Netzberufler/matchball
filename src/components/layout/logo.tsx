import Link from "next/link";
import { SquareMark } from "./square-mark";
import { Wordmark } from "./wordmark";

// The logo's font size: the wordmark is sized in em of it
const sizes = {
    small: "text-2xl",
    default: "text-[2rem]",
    large: "text-[2.5rem]",
};

// compact: only the square logo below lg, for the narrow tablet sidebar
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
            {compact && <SquareMark className="size-9 shrink-0 lg:hidden" />}
            <Wordmark
                className={`h-[1.05em] w-auto shrink-0 ${
                    compact ? "hidden lg:block" : ""
                }`}
            />
        </Link>
    );
}
