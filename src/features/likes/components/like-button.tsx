"use client";

import { Heart } from "lucide-react";
import { Button } from "@heroui/react";
import { setCommentLiked } from "@/features/likes/actions/set-comment-liked";
import { setLiked } from "@/features/likes/actions/set-liked";
import { likeStates } from "@/features/likes/lib/like-store";

// "999", "1.2K", "3.4M"
const countFormat = new Intl.NumberFormat("en", { notation: "compact" });

// Saves a like of a post or a comment
const saveLike = { post: setLiked, comment: setCommentLiked };

// The latest like request per post or comment. Only its answer is applied,
// so quick clicks can't be undone by an earlier, slower answer.
const latestRequests = new Map<string, number>();
let requestCount = 0;

// The heart under a post or comment. It switches and counts right away, and
// saves in the background; if saving fails, it switches back.
export function LikeButton({
    kind,
    id,
    isLiked: initialIsLiked,
    likeCount: initialLikeCount,
}: {
    kind: "post" | "comment";
    // The post's or comment's id
    id: string;
    isLiked: boolean;
    likeCount: number;
}) {
    // Posts and comments are kept apart in the store and request map
    const key = `${kind}:${id}`;
    const { isLiked, likeCount } = likeStates.useValue(key, {
        isLiked: initialIsLiked,
        likeCount: initialLikeCount,
    });

    function onPress() {
        const previous = { isLiked, likeCount };
        const like = !isLiked;
        likeStates.set(key, {
            isLiked: like,
            likeCount: Math.max(0, likeCount + (like ? 1 : -1)),
        });

        const request = ++requestCount;
        latestRequests.set(key, request);
        const isLatest = () => latestRequests.get(key) === request;
        saveLike[kind](id, like).then(
            // The server's count includes other people's likes since loading
            (saved) => isLatest() && likeStates.set(key, saved),
            () => isLatest() && likeStates.set(key, previous),
        );
    }

    const formattedCount = countFormat.format(likeCount);
    return (
        <Button
            size="sm"
            variant="ghost"
            // A toggle: the label stays, and aria-pressed says whether it's
            // liked. The label replaces the content, so it has the count.
            aria-label={`Like (${formattedCount})`}
            aria-pressed={isLiked}
            className={`gap-1.5 px-2 tabular-nums ${
                isLiked ? "text-danger" : "text-muted"
            }`}
            onPress={onPress}
        >
            <Heart
                className={`size-4 transition-transform ${
                    isLiked ? "scale-110 fill-current" : ""
                }`}
                aria-hidden
            />
            <span>{formattedCount}</span>
        </Button>
    );
}
