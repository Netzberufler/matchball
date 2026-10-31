"use client";

import { useRouter } from "next/navigation";
import type { Viewer } from "@/features/auth/components/viewer-provider";
import { MatchForm } from "./match-form";
import type { PublicUser } from "@/features/profile/utils/public-user";

// The form for a new match, empty every time it's opened with a link or
// after a match was saved. Next.js keeps visited pages mounted, so without
// the key it would still hold the last match entered. Back and forward
// restore what was entered, as bfcacheId stays the same for them. With
// `opponent` (from a profile), it starts with them chosen.
export function AddMatchForm({
    viewer,
    opponent,
}: {
    viewer: Viewer;
    opponent: PublicUser | null;
}) {
    const { bfcacheId } = useRouter();
    return (
        <MatchForm key={bfcacheId} viewer={viewer} initialOpponent={opponent} />
    );
}
