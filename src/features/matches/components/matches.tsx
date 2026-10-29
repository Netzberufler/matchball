import { requireSession } from "@/features/auth/lib/session";
import {
    getPendingMatches,
    getRecentMatches,
} from "@/features/matches/lib/queries";
import { MatchTable } from "./match-table";
import { PendingMatches } from "./pending-matches";

// The signed-in user's pending matches, if any, above their latest
// confirmed ones. Reads the session and the database at request time, so
// render it inside <Suspense> with <MatchesFallback />.
export async function Matches() {
    const { user } = await requireSession();
    const [pending, recent] = await Promise.all([
        getPendingMatches(user.id),
        getRecentMatches(user.id),
    ]);
    return (
        <div className="flex flex-col gap-6">
            {pending.length > 0 && (
                <section className="flex flex-col gap-3">
                    <SectionHeading>Pending</SectionHeading>
                    <PendingMatches matches={pending} />
                </section>
            )}
            <section className="flex flex-col gap-3">
                <SectionHeading>Completed</SectionHeading>
                <MatchTable matches={recent} />
            </section>
        </div>
    );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
    return <h2 className="text-base font-semibold">{children}</h2>;
}

// Shown while the matches load: the completed table's placeholder rows,
// as most of the time nothing is pending
export function MatchesFallback() {
    return (
        <section className="flex flex-col gap-3">
            <SectionHeading>Completed</SectionHeading>
            <MatchTable matches={null} />
        </section>
    );
}
