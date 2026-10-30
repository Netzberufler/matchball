import { Suspense } from "react";
import type { Metadata } from "next";
import { BackButton } from "@/components/ui/back-button";
import { Notifications } from "@/features/notifications/components/notifications";
import { NotificationTabsFallback } from "@/features/notifications/components/notification-tabs";

export const metadata: Metadata = {
    title: "Notifications",
};

export default function NotificationsPage() {
    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                {/* Always home, as this is a top-level section */}
                <BackButton href="/" />
                <h1 className="text-xl font-semibold">Notifications</h1>
            </div>
            {/* Reads the session at request time */}
            <Suspense fallback={<NotificationTabsFallback />}>
                <Notifications />
            </Suspense>
        </>
    );
}
