import { requireSession } from "@/features/auth/lib/session";
import { getChallengesPage } from "@/features/challenges/lib/queries";
import { ChallengeTable } from "./challenge-table";

// The signed-in user's challenges, newest first. Reads the session and the
// database at request time, so render it inside <Suspense> with
// <ChallengeTableFallback />.
export async function Challenges() {
    const { user } = await requireSession();
    const firstPage = await getChallengesPage(user.id);
    return <ChallengeTable firstPage={firstPage} />;
}
