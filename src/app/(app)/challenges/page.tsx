import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Challenges",
};

export default function ChallengesPage() {
    return (
        <>
            <h1 className="text-xl mb-4 font-semibold">Challenges</h1>
            <p className="text-muted">Challenge other players to a match.</p>
        </>
    );
}
