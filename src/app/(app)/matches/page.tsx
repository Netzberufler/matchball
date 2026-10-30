import { Suspense } from "react";
import type { Metadata } from "next";
import { BackButton } from "@/components/ui/back-button";
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
            <div className="mb-4 flex items-center gap-2">
                {/* Always home, as the matches are a top-level section */}
                <BackButton href="/" />
                <h1 className="text-xl font-semibold">Matches</h1>
            </div>
            {/* Reads the session at request time */}
            <Suspense fallback={<MatchesFallback />}>
                <Matches />
            </Suspense>
        </>
    );
}
