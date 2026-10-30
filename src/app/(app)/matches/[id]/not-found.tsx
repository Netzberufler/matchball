import Link from "next/link";
import { buttonVariants } from "@heroui/react";

export default function MatchNotFound() {
    return (
        <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-2 text-center">
            {/* The page's only heading: this replaces the whole match page */}
            <h1 className="text-xl font-semibold">
                This match doesn&apos;t exist
            </h1>
            <p className="text-muted">
                Only confirmed matches have a page. It may still be pending, or
                have been declined or withdrawn.
            </p>
            {/* A link styled as a HeroUI button */}
            <Link href="/matches" className={`mt-4 ${buttonVariants()}`}>
                Back to Matches
            </Link>
        </div>
    );
}
