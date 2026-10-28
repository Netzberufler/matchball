import { Suspense } from "react";
import type { Metadata } from "next";
import { Matches } from "@/features/matches/components/matches";
import { MatchTableFallback } from "@/features/matches/components/match-table";

export const metadata: Metadata = {
    title: "Matches",
};

export default function MatchesPage() {
    return (
        <>
            <h1 className="text-xl mb-4 font-semibold">Matches</h1>
            {/* Reads the session at request time */}
            <Suspense fallback={<MatchTableFallback />}>
                <Matches />
            </Suspense>
        </>
    );
}
