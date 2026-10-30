import type { Metadata } from "next";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
    title: "Search",
};

export default function SearchPage() {
    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                {/* Always home, as this is a top-level section */}
                <BackButton href="/" />
                <h1 className="text-xl font-semibold">Search</h1>
            </div>
            <p className="text-muted">Find players, clubs and matches.</p>
        </>
    );
}
