import Link from "next/link";
import { buttonVariants } from "@heroui/react";

export default function PostNotFound() {
    return (
        <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-2 text-center">
            {/* The page's only heading: this replaces the whole post page */}
            <h1 className="text-xl font-semibold">
                This post doesn&apos;t exist
            </h1>
            <p className="text-muted">
                It may have been deleted, or the link is wrong.
            </p>
            {/* A link styled as a HeroUI button */}
            <Link href="/" className={`mt-4 ${buttonVariants()}`}>
                Back to Home
            </Link>
        </div>
    );
}
