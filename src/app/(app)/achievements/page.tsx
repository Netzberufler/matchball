import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Achievements",
};

export default function AchievementsPage() {
    return (
        <>
            <h1 className="text-xl mb-4 font-semibold">Achievements</h1>
            <p className="text-muted">Earn badges and track your milestones.</p>
        </>
    );
}
