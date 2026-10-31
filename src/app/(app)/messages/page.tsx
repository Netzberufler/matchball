import { Suspense } from "react";
import type { Metadata } from "next";
import { BackButton } from "@/components/ui/back-button";
import { ResetWhenHidden } from "@/components/ui/reset-when-hidden";
import { Conversations } from "@/features/messages/components/conversations";
import { ConversationListFallback } from "@/features/messages/components/conversation-list";
import { NewChatButton } from "@/features/messages/components/new-chat-button";

export const metadata: Metadata = {
    title: "Messages",
};

export default function MessagesPage() {
    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                {/* Always home, as this is a top-level section */}
                <BackButton href="/" />
                <h1 className="text-xl font-semibold">Messages</h1>
                <div className="ml-auto">
                    {/* Choosing someone leaves the page while the popup
                        closes, which would stay half closed */}
                    <ResetWhenHidden>
                        <NewChatButton />
                    </ResetWhenHidden>
                </div>
            </div>
            {/* Reads the session at request time */}
            <Suspense fallback={<ConversationListFallback />}>
                <Conversations />
            </Suspense>
        </>
    );
}
