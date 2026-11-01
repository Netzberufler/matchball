import { Suspense } from "react";
import type { Metadata } from "next";
import { BackButton } from "@/components/ui/back-button";
import { Challenges } from "@/features/challenges/components/challenges";
import { ChallengeTableFallback } from "@/features/challenges/components/challenge-table";

export const metadata: Metadata = {
    title: "Challenges",
};

export default function ChallengesPage() {
    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                {/* Always home, as this is a top-level section */}
                <BackButton href="/" />
                <h1 className="text-xl font-semibold">Challenges</h1>
            </div>
            {/* Reads the session at request time */}
            <Suspense fallback={<ChallengeTableFallback />}>
                <Challenges />
            </Suspense>
        </>
    );
}
