"use client";

import { Heart } from "lucide-react";
import { Button } from "@heroui/react";
import { setLiked } from "@/features/likes/actions/set-liked";
import { setLikeState, useLikeState } from "@/features/likes/lib/like-store";

// "999", "1.2K", "3.4M"
const countFormat = new Intl.NumberFormat("en", { notation: "compact" });

// The latest like request per post. Only its answer is applied, so quick
// clicks can't be undone by an earlier, slower answer.
const latestRequests = new Map<string, number>();
let requestCount = 0;

// The heart under a post. It switches and counts right away, and saves in
// the background; if saving fails, it switches back.
export function LikeButton({
    postId,
    isLiked: initialIsLiked,
    likeCount: initialLikeCount,
}: {
    postId: string;
    isLiked: boolean;
    likeCount: number;
}) {
    const { isLiked, likeCount } = useLikeState(postId, {
        isLiked: initialIsLiked,
        likeCount: initialLikeCount,
    });

    function onPress() {
        const previous = { isLiked, likeCount };
        const like = !isLiked;
        setLikeState(postId, {
            isLiked: like,
            likeCount: Math.max(0, likeCount + (like ? 1 : -1)),
        });

        const request = ++requestCount;
        latestRequests.set(postId, request);
        const isLatest = () => latestRequests.get(postId) === request;
        setLiked(postId, like).then(
            // The server's count includes other people's likes since loading
            (saved) => isLatest() && setLikeState(postId, saved),
            () => isLatest() && setLikeState(postId, previous),
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
