import Link from "next/link";
import { buttonVariants } from "@heroui/react";

export default function ProfileNotFound() {
    return (
        <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-2 text-center">
            {/* The page's only heading: this replaces the whole profile page */}
            <h1 className="text-xl font-semibold">
                This account doesn&apos;t exist
            </h1>
            <p className="text-muted">Check the username and try again.</p>
            {/* A link styled as a HeroUI button */}
            <Link href="/" className={`mt-4 ${buttonVariants()}`}>
                Back to Home
            </Link>
        </div>
    );
}
