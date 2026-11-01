"use client";

import { useRouter } from "next/navigation";
import type { Viewer } from "@/features/auth/components/viewer-provider";
import { type ChallengeToLog, MatchForm } from "./match-form";
import type { PublicUser } from "@/features/profile/utils/public-user";

// The form for a new match, empty every time it's opened with a link or
// after a match was saved. Next.js keeps visited pages mounted, so without
// the key it would still hold the last match entered. Back and forward
// restore what was entered, as bfcacheId stays the same for them. With
// `opponent` (from a profile), it starts with them chosen. With
// `challenge`, it's that challenge's match, against its fixed opponent.
export function AddMatchForm({
    viewer,
    opponent = null,
    challenge,
}: {
    viewer: Viewer;
    opponent?: PublicUser | null;
    challenge?: ChallengeToLog;
}) {
    const { bfcacheId } = useRouter();
    return (
        <MatchForm
            key={bfcacheId}
            viewer={viewer}
            initialOpponent={opponent}
            challenge={challenge}
        />
    );
}
