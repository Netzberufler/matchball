import type { Metadata } from "next";
import { BackButton } from "@/components/ui/back-button";

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
            </div>
            <p className="text-muted">Chat with other players.</p>
        </>
    );
}
