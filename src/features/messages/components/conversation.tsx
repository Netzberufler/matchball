import Link from "next/link";
import { notFound } from "next/navigation";
import { Skeleton } from "@heroui/react";
import { UserIdentity } from "@/components/ui/user-identity";
import { requireSession } from "@/features/auth/lib/session";
import {
    findConversationId,
    getChatPartner,
    getMessagesPage,
} from "@/features/messages/lib/queries";
import { profilePath } from "@/features/profile/utils/profile-path";
import {
    ConversationView,
    ConversationViewFallback,
} from "./conversation-view";

// The conversation with the user `username`: whom it's with, then the
// messages. A 404 for unknown users and for the signed-in user, who can't
// write to themselves. Reads the session and the database at request time,
// so render it inside <Suspense> with <ConversationFallback />.
export async function Conversation({ username }: { username: string }) {
    const [{ user }, partner] = await Promise.all([
        requireSession(),
        getChatPartner(username),
    ]);
    if (!partner || partner.id === user.id) {
        notFound();
    }
    const conversationId = await findConversationId(user.id, partner.id);
    const firstPage = conversationId
        ? await getMessagesPage(conversationId, user.id)
        : { items: [], nextCursor: null };

    return (
        <>
            <Link
                href={profilePath(partner.username)}
                className="mb-4 flex min-w-0 items-center gap-3 rounded-full p-1 pr-4 transition-colors hover:bg-default md:mb-6"
            >
                <UserIdentity user={partner} />
            </Link>
            <ConversationView
                // Start over when going to another conversation
                key={partner.id}
                partner={partner}
                firstPage={firstPage}
                hasReceived={firstPage.items.some((message) => !message.isOwn)}
            />
        </>
    );
}

// Shown while the conversation loads
export function ConversationFallback() {
    return (
        <div aria-hidden>
            <div className="mb-4 flex items-center gap-3 p-1 md:mb-6">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-3.5 w-36 rounded-full" />
                    <Skeleton className="h-3 w-24 rounded-full" />
                </div>
            </div>
            <ConversationViewFallback />
        </div>
    );
}
