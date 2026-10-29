import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Skeleton } from "@heroui/react";
import { BackButton } from "@/components/ui/back-button";
import { requireSession } from "@/features/auth/lib/session";
import { MatchForm } from "@/features/matches/components/match-form";
import { getEditableMatch } from "@/features/matches/lib/queries";

export const metadata: Metadata = {
    title: "Edit Match",
};

// The params are only known at request time, so everything that reads them
// is inside <Suspense>
export default function EditMatchPage({
    params,
}: PageProps<"/matches/[id]/edit">) {
    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                <BackButton fallbackHref="/matches" />
                <h1 className="text-xl font-semibold">Edit match</h1>
            </div>
            <Suspense fallback={<Skeleton className="h-96 rounded-3xl" />}>
                {params.then(({ id }) => (
                    <EditMatch id={id} />
                ))}
            </Suspense>
        </>
    );
}

// The form for one of the user's pending matches; a 404 if there's no such
// match, or it's not theirs or no longer pending
async function EditMatch({ id }: { id: string }) {
    const { user } = await requireSession();
    const match = await getEditableMatch(id, user.id);
    if (!match) {
        notFound();
    }
    // A new version starts a new form. Next.js keeps visited pages
    // mounted, so without the key the form would keep what it held.
    return (
        <MatchForm
            key={match.version.getTime()}
            viewer={{ name: user.name, image: user.image }}
            match={match}
        />
    );
}
