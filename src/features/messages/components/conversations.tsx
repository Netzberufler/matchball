import { requireSession } from "@/features/auth/lib/session";
import { getConversationsPage } from "@/features/messages/lib/queries";
import { ConversationList } from "./conversation-list";

// The signed-in user's conversations, the most recent first. Reads the
// session and the database at request time, so render it inside
// <Suspense> with <ConversationListFallback />.
export async function Conversations() {
    const { user } = await requireSession();
    const firstPage = await getConversationsPage(user.id);
    return <ConversationList firstPage={firstPage} />;
}
