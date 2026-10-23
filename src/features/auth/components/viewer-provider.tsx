"use client";

import { createContext, use } from "react";

// What client components may know about the signed-in user
export type Viewer = { name: string; image?: string | null };

const ViewerContext = createContext<Viewer | null>(null);

// Hands the signed-in user to the client components below it, e.g. reply
// forms deep inside a feed, without passing it through every component.
// Render it in a server component that already read the session.
export function ViewerProvider({
    viewer,
    children,
}: {
    viewer: Viewer;
    children: React.ReactNode;
}) {
    return <ViewerContext value={viewer}>{children}</ViewerContext>;
}

// The signed-in user, or null outside a ViewerProvider
export function useViewer() {
    return use(ViewerContext);
}
