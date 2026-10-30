import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Messages",
};

export default function MessagesPage() {
    return (
        <>
            <h1 className="text-xl mb-4 font-semibold">Messages</h1>
            <p className="text-muted">Chat with other players.</p>
        </>
    );
}
