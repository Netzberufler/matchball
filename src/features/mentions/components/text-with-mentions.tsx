import Link from "next/link";
import { splitMentions } from "@/features/mentions/utils/mentions";
import { profilePath } from "@/features/profile/utils/profile-path";

// Post or comment text with its @mentions of real users (`mentions`, as
// saved) linked to their profiles. Without `linkMentions`, e.g. in the
// reply popup's preview, they're only highlighted.
export function TextWithMentions({
    text,
    mentions,
    linkMentions = true,
}: {
    text: string;
    mentions: string[];
    linkMentions?: boolean;
}) {
    return splitMentions(text, mentions).map((part, index) =>
        part.type === "text" ? (
            part.text
        ) : linkMentions ? (
            <Link
                key={index}
                href={profilePath(part.username)}
                className="text-accent hover:underline"
            >
                {part.text}
            </Link>
        ) : (
            <span key={index} className="text-accent">
                {part.text}
            </span>
        ),
    );
}
