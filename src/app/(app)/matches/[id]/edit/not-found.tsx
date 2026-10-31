import Link from "next/link";
import { buttonVariants } from "@heroui/react";
import { MATCHES_PATH } from "@/features/matches/utils/match-path";

export default function EditMatchNotFound() {
    return (
        <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-2 text-center">
            {/* The page's only heading: this replaces the whole edit page */}
            <h1 className="text-xl font-semibold">
                This match can&apos;t be edited
            </h1>
            <p className="text-muted">
                Only pending matches you play in can be changed. It may have
                been accepted, declined or withdrawn in the meantime.
            </p>
            {/* A link styled as a HeroUI button */}
            <Link href={MATCHES_PATH} className={`mt-4 ${buttonVariants()}`}>
                Back to Matches
            </Link>
        </div>
    );
}
