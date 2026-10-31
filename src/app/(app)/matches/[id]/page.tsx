import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { requireSession } from "@/features/auth/lib/session";
import {
    MatchDetail,
    MatchDetailFallback,
} from "@/features/matches/components/match-detail";
import { getMatch } from "@/features/matches/lib/queries";
import { MATCHES_PATH } from "@/features/matches/utils/match-path";

export async function generateMetadata({
    params,
}: PageProps<"/matches/[id]">): Promise<Metadata> {
    const [{ id }, { user }] = await Promise.all([params, requireSession()]);
    // Same arguments as in MatchView, so cache() shares the lookup
    const match = await getMatch(id, user.id);
    return {
        title: match
            ? `${match.left.name} vs ${match.right.name}`
            : "Match not found",
    };
}

// The params are only known at request time, so everything that reads them
// is inside <Suspense>
export default function MatchPage({ params }: PageProps<"/matches/[id]">) {
    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                <BackButton fallbackHref={MATCHES_PATH} />
                <h1 className="text-xl font-semibold">Match</h1>
            </div>
            <Suspense fallback={<MatchDetailFallback />}>
                {params.then(({ id }) => (
                    <MatchView id={id} />
                ))}
            </Suspense>
        </>
    );
}

// A 404 unless the match is confirmed
async function MatchView({ id }: { id: string }) {
    const { user } = await requireSession();
    const match = await getMatch(id, user.id);
    if (!match) {
        notFound();
    }
    return <MatchDetail match={match} />;
}
