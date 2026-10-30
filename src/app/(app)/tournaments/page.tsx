import type { Metadata } from "next";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
    title: "Tournaments",
};

export default function TournamentsPage() {
    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                {/* Always home, as this is a top-level section */}
                <BackButton href="/" />
                <h1 className="text-xl font-semibold">Tournaments</h1>
            </div>
            <p className="text-muted">
                Discover and join tournaments at clubs near you.
            </p>
        </>
    );
}
