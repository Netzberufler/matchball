import { Suspense } from "react";
import type { Metadata } from "next";
import {
    Matches,
    MatchesFallback,
} from "@/features/matches/components/matches";

export const metadata: Metadata = {
    title: "Matches",
};

export default function MatchesPage() {
    return (
        <>
            <h1 className="mb-4 text-xl font-semibold">Matches</h1>
            {/* Reads the session at request time */}
            <Suspense fallback={<MatchesFallback />}>
                <Matches />
            </Suspense>
        </>
    );
}
