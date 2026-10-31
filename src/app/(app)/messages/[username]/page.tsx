import { Suspense } from "react";
import type { Metadata } from "next";
import { BackButton } from "@/components/ui/back-button";
import {
    Conversation,
    ConversationFallback,
} from "@/features/messages/components/conversation";
import { getChatPartner } from "@/features/messages/lib/queries";
import { MESSAGES_PATH } from "@/features/messages/utils/messages-path";

export async function generateMetadata({
    params,
}: PageProps<"/messages/[username]">): Promise<Metadata> {
    const { username } = await params;
    const partner = await getChatPartner(username);
    return {
        title: partner
            ? `Chat with ${partner.name} (@${partner.username})`
            : "Conversation not found",
    };
}

// The params are only known at request time, so everything that reads them
// is inside <Suspense>
export default function ConversationPage({
    params,
}: PageProps<"/messages/[username]">) {
    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                {/* Always the list, which is where conversations open from */}
                <BackButton href={MESSAGES_PATH} />
                <h1 className="text-xl font-semibold">Messages</h1>
            </div>
            <Suspense fallback={<ConversationFallback />}>
                {params.then(({ username }) => (
                    <Conversation username={username} />
                ))}
            </Suspense>
        </>
    );
}
