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
import { MatchStatsCards, MatchStatsCardsFallback } from "./match-stats-cards";
import { addMatchPath } from "@/features/matches/utils/match-path";
import { MatchTable } from "./match-table";
import { PendingMatches } from "./pending-matches";

// The signed-in user's statistics, then their pending matches, if any, and
// all their confirmed ones. Without confirmed matches there are no
// statistics to show. Reads the session and the database at request time, so render it
// inside <Suspense> with <MatchesFallback />.
export async function Matches() {
    const { user } = await requireSession();
    const [pending, confirmed] = await Promise.all([
        getPendingMatches(user.id),
        getAllMatches(user.id),
    ]);
    return (
        <div className="flex flex-col gap-6">
            {confirmed.length > 0 && <MatchStatsCards matches={confirmed} />}
            {pending.length > 0 && (
                <section className="flex flex-col gap-3">
                    <h2 className="text-base font-semibold">Pending</h2>
                    <PendingMatches matches={pending} />
                </section>
            )}
            <FilterableMatchTable
                matches={confirmed}
                addMatchHref={addMatchPath()}
            />
        </div>
    );
}

// Shown while the matches load: placeholder statistics and table rows, as
// most of the time nothing is pending
export function MatchesFallback() {
    return (
        <div className="flex flex-col gap-6">
            <MatchStatsCardsFallback />
            <section className="flex flex-col gap-3">
                <MatchesHeading />
                <div className="flex">
                    <AddMatchLink href={addMatchPath()} />
                </div>
                <MatchTable matches={null} />
            </section>
        </div>
    );
}
