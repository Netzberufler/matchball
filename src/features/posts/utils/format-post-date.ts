const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const dayFormat = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
});
const dayWithYearFormat = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
});
const fullFormat = new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeStyle: "short",
});

// Short, Twitter-style post times: "now", "5m", "3h", "Oct 12", "Oct 12, 2025"
export function formatPostDate(date: Date, now = new Date()) {
    const elapsed = now.getTime() - date.getTime();
    if (elapsed < MINUTE) {
        return "now";
    }
    if (elapsed < HOUR) {
        return `${Math.floor(elapsed / MINUTE)}m`;
    }
    if (elapsed < DAY) {
        return `${Math.floor(elapsed / HOUR)}h`;
    }
    if (date.getFullYear() === now.getFullYear()) {
        return dayFormat.format(date);
    }
    return dayWithYearFormat.format(date);
}

// E.g. "October 18, 2026 at 3:42 PM": on a post's own page, and in the
// tooltip on the short time in feeds
export function formatFullPostDate(date: Date) {
    return fullFormat.format(date);
}
