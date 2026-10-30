import type { Metadata } from "next";
import { BackButton } from "@/components/ui/back-button";

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
            <p className="text-muted">Challenge other players to a match.</p>
        </>
    );
}
