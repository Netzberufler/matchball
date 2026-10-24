import { requireSession } from "@/features/auth/lib/session";
import { getNotificationsPage } from "@/features/notifications/lib/queries";
import { NotificationTabs } from "./notification-tabs";

// The signed-in user's notifications, with the tabs that filter them. Reads
// the session and the database at request time, so render it inside
// <Suspense> with <NotificationTabsFallback />. Loads the first page of
// "All"; NotificationTabs loads the rest.
export async function Notifications() {
    const { user } = await requireSession();
    const firstPage = await getNotificationsPage(user.id, "all");
    return <NotificationTabs firstPage={firstPage} />;
}
