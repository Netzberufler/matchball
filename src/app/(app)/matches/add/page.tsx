import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Skeleton } from "@heroui/react";
import { BackButton } from "@/components/ui/back-button";
import { requireSession } from "@/features/auth/lib/session";
import { EmptyCard } from "@/components/ui/list-card";
import { getLoggableChallenge } from "@/features/challenges/lib/queries";
import { CHALLENGES_PATH } from "@/features/challenges/utils/challenge-path";
import { AddMatchForm } from "@/features/matches/components/add-match-form";
import {
    CHALLENGE_PARAM,
    MATCHES_PATH,
    OPPONENT_PARAM,
} from "@/features/matches/utils/match-path";
import { getProfileUser } from "@/features/profile/lib/queries";

export const metadata: Metadata = {
    title: "Add Match",
};

export default function AddMatchPage({
    searchParams,
}: PageProps<"/matches/add">) {
    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                <BackButton fallbackHref={MATCHES_PATH} />
                <h1 className="text-xl font-semibold">Add match</h1>
            </div>
            {/* Reads the session at request time */}
            <Suspense fallback={<Skeleton className="h-96 rounded-3xl" />}>
                <AddMatch searchParams={searchParams} />
            </Suspense>
        </>
    );
}

// Rendered at request time, not prerendered: the date picker works from
// today's date. With ?opponent=<username> (from a profile), the form starts
// with that user as the opponent, unless there's no such user or it's the
// viewer, who can't play themselves. With ?challenge=<id> (from
// /challenges), it's the match of that accepted challenge, whose opponent
// is fixed.
async function AddMatch({
    searchParams,
}: {
    searchParams: PageProps<"/matches/add">["searchParams"];
}) {
    const [{ user }, params] = await Promise.all([
        requireSession(),
        searchParams,
    ]);
    const viewer = { name: user.name, image: user.image };

    const challengeId = params[CHALLENGE_PARAM];
    if (typeof challengeId === "string") {
        const challenge = await getLoggableChallenge(challengeId, user.id);
        if (!challenge) {
            return (
                <EmptyCard>
                    This challenge&apos;s match was already logged, or the
                    challenge isn&apos;t accepted. See your{" "}
                    <Link
                        href={CHALLENGES_PATH}
                        className="text-accent hover:underline"
                    >
                        challenges
                    </Link>
                    .
                </EmptyCard>
            );
        }
        return <AddMatchForm viewer={viewer} challenge={challenge} />;
    }

    const username = params[OPPONENT_PARAM];
    const found =
        typeof username === "string" ? await getProfileUser(username) : null;
    const opponent =
        found && found.id !== user.id
            ? {
                  id: found.id,
                  username: found.username,
                  name: found.name,
                  image: found.image,
              }
            : null;
    return <AddMatchForm viewer={viewer} opponent={opponent} />;
}
