import { UserAvatar } from "@/components/ui/user-avatar";
import {
    formatFullPostDate,
    formatPostDate,
} from "@/features/posts/utils/format-post-date";
import { TextWithMentions } from "@/features/mentions/components/text-with-mentions";

// What a preview shows; posts and comments both have it
export type PreviewItem = {
    content: string;
    createdAt: Date;
    // The usernames mentioned in the text that belong to real users
    mentions: string[];
    author: { name: string; username: string; image: string | null };
};

// A read-only post or comment, e.g. in the reply popup to show what's being
// replied to: author, time and text, without links or buttons
export function PostPreview({ post }: { post: PreviewItem }) {
    const { author } = post;

    return (
        <div className="flex gap-3">
            <UserAvatar name={author.name} image={author.image} />
            <div className="min-w-0 flex-1">
                <p className="flex items-baseline gap-1 text-sm">
                    <span className="truncate font-semibold text-foreground">
                        {author.name}
                    </span>{" "}
                    <span className="truncate text-muted">
                        @{author.username}
                    </span>
                    <span className="text-muted" aria-hidden>
                        ·
                    </span>
                    {/* The relative time can differ between the server and
                        the browser, e.g. "4m" and "5m" */}
                    <time
                        suppressHydrationWarning
                        className="shrink-0 text-muted"
                        dateTime={post.createdAt.toISOString()}
                        title={formatFullPostDate(post.createdAt)}
                    >
                        {formatPostDate(post.createdAt)}
                    </time>
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words">
                    {/* Read-only: mentions are highlighted, not links */}
                    <TextWithMentions
                        text={post.content}
                        mentions={post.mentions}
                        linkMentions={false}
                    />
                </p>
            </div>
        </div>
    );
}
