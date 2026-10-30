import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@heroui/react";
import { BackButton } from "@/components/ui/back-button";
import { requireSession } from "@/features/auth/lib/session";
import { AddMatchForm } from "@/features/matches/components/add-match-form";
import { OPPONENT_PARAM } from "@/features/matches/utils/match-path";
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
                <BackButton fallbackHref="/matches" />
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
// viewer, who can't play themselves.
async function AddMatch({
    searchParams,
}: {
    searchParams: PageProps<"/matches/add">["searchParams"];
}) {
    const [{ user }, params] = await Promise.all([
        requireSession(),
        searchParams,
    ]);
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
    return (
        <AddMatchForm
            viewer={{ name: user.name, image: user.image }}
            opponent={opponent}
        />
    );
}
