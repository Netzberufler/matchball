import { requireSession } from "@/features/auth/lib/session";
import { getNotificationsPage } from "@/features/notifications/lib/queries";
import { NotificationList } from "./notification-list";

// The signed-in user's notifications. Reads the session and the database at
// request time, so render it inside <Suspense> with
// <NotificationListFallback />. Loads the first page; NotificationList
// loads the rest.
export async function Notifications() {
    const { user } = await requireSession();
    const firstPage = await getNotificationsPage(user.id);
    return <NotificationList firstPage={firstPage} />;
}
