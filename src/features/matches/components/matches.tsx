import { requireSession } from "@/features/auth/lib/session";
import { getRecentMatches } from "@/features/matches/lib/queries";
import { MatchTable } from "./match-table";

// The signed-in user's latest matches. Reads the session and the database
// at request time, so render it inside <Suspense> with
// <MatchTableFallback />.
export async function Matches() {
    const { user } = await requireSession();
    const matches = await getRecentMatches(user.id);
    return <MatchTable matches={matches} />;
}
