import { requireSession } from "@/features/auth/lib/session";
import { getNotificationsPage } from "@/features/notifications/lib/queries";
import { NO_NOTIFICATION_FILTERS } from "@/features/notifications/utils/notification-filters";
import { NotificationFeed } from "./notification-feed";

// The signed-in user's notifications, with the buttons that filter them.
// Reads the session and the database at request time, so render it inside
// <Suspense> with <NotificationFeedFallback />. Loads the first page
// without filters; NotificationFeed loads the rest.
export async function Notifications() {
    const { user } = await requireSession();
    const loadedAt = new Date();
    const firstPage = await getNotificationsPage(
        user.id,
        NO_NOTIFICATION_FILTERS,
    );
    return <NotificationFeed firstPage={firstPage} loadedAt={loadedAt} />;
}
