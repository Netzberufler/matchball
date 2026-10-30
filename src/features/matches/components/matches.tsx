import { requireSession } from "@/features/auth/lib/session";
import {
    getAllMatches,
    getPendingMatches,
} from "@/features/matches/lib/queries";
import {
    AddMatchLink,
    FilterableMatchTable,
    MatchesHeading,
} from "./filterable-match-table";
import { MatchTable } from "./match-table";
import { PendingMatches } from "./pending-matches";

// The signed-in user's pending matches, if any, above all their confirmed
// ones. Reads the session and the database at request time, so render it
// inside <Suspense> with <MatchesFallback />.
export async function Matches() {
    const { user } = await requireSession();
    const [pending, confirmed] = await Promise.all([
        getPendingMatches(user.id),
        getAllMatches(user.id),
    ]);
    return (
        <div className="flex flex-col gap-6">
            {pending.length > 0 && (
                <section className="flex flex-col gap-3">
                    <h2 className="text-base font-semibold">Pending</h2>
                    <PendingMatches matches={pending} />
                </section>
            )}
            <FilterableMatchTable matches={confirmed} />
        </div>
    );
}

// Shown while the matches load: the confirmed table's placeholder rows,
// as most of the time nothing is pending
export function MatchesFallback() {
    return (
        <section className="flex flex-col gap-3">
            <MatchesHeading />
            <div className="flex">
                <AddMatchLink />
            </div>
            <MatchTable matches={null} />
        </section>
    );
}
