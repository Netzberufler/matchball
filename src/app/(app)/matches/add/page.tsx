import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@heroui/react";
import { BackButton } from "@/components/ui/back-button";
import { requireSession } from "@/features/auth/lib/session";
import { AddMatchForm } from "@/features/matches/components/add-match-form";

export const metadata: Metadata = {
    title: "Add Match",
};

export default function AddMatchPage() {
    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                <BackButton fallbackHref="/matches" />
                <h1 className="text-xl font-semibold">Add match</h1>
            </div>
            {/* Reads the session at request time */}
            <Suspense fallback={<Skeleton className="h-96 rounded-3xl" />}>
                <AddMatch />
            </Suspense>
        </>
    );
}

// Rendered at request time, not prerendered: the date picker works from
// today's date
async function AddMatch() {
    await requireSession();
    return <AddMatchForm />;
}
