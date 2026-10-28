import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@heroui/react";
import { Matches } from "@/features/matches/components/matches";
import { MatchTableFallback } from "@/features/matches/components/match-table";

export const metadata: Metadata = {
    title: "Matches",
};

export default function MatchesPage() {
    return (
        <>
            <div className="mb-4 flex items-center justify-between gap-2">
                <h1 className="text-xl font-semibold">Matches</h1>
                {/* A link styled as a HeroUI button */}
                <Link
                    href="/matches/add"
                    className={buttonVariants({
                        variant: "primary",
                        size: "sm",
                    })}
                >
                    <Plus className="size-4" aria-hidden />
                    Add new
                </Link>
            </div>
            {/* Reads the session at request time */}
            <Suspense fallback={<MatchTableFallback />}>
                <Matches />
            </Suspense>
        </>
    );
}
