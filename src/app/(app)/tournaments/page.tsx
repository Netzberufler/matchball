import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tournaments",
};

export default function TournamentsPage() {
    return (
        <>
            <h1 className="text-xl mb-4 font-semibold">Tournaments</h1>
            <p className="text-muted">
                Discover and join tournaments at clubs near you.
            </p>
        </>
    );
}
