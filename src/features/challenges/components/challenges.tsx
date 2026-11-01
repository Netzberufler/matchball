import { requireSession } from "@/features/auth/lib/session";
import {
    getChallengeOpponents,
    getChallengesPage,
} from "@/features/challenges/lib/queries";
import { NO_CHALLENGE_FILTERS } from "@/features/challenges/utils/challenge-filters";
import { ChallengeTable } from "./challenge-table";

// The signed-in user's challenges, newest first, with the opponents to
// filter them by. Reads the session and the database at request time, so
// render it inside <Suspense> with <ChallengeTableFallback />.
export async function Challenges() {
    const { user } = await requireSession();
    const [firstPage, opponents] = await Promise.all([
        getChallengesPage(user.id, NO_CHALLENGE_FILTERS),
        getChallengeOpponents(user.id),
    ]);
    return <ChallengeTable firstPage={firstPage} opponents={opponents} />;
}
