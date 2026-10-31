import {
    formatFullPostDate,
    formatPostDate,
} from "@/features/posts/utils/format-post-date";

// When something happened, e.g. "5m" or "Oct 12" (see formatPostDate, or
// `format`), with the full date and time on hover. The time can differ
// between the server and the browser, e.g. "4m" and "5m", or in another
// time zone, so React doesn't warn about it.
export function RelativeTime({
    date,
    format = formatPostDate,
    className,
}: {
    date: Date;
    format?: (date: Date) => string;
    className?: string;
}) {
    return (
        <time
            suppressHydrationWarning
            dateTime={date.toISOString()}
            title={formatFullPostDate(date)}
            className={className}
        >
            {format(date)}
        </time>
    );
}
