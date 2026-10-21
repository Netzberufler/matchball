"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Button } from "@heroui/react";
import { setFollowing } from "@/features/follows/actions/set-following";

// Switches between Follow and Unfollow right away and saves in the
// background; if saving fails, it switches back and shows an error
export function FollowButton({
    userId,
    name,
    initialIsFollowing,
}: {
    userId: string;
    name: string;
    initialIsFollowing: boolean;
}) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [optimisticIsFollowing, setOptimisticIsFollowing] =
        useOptimistic(isFollowing);
    const [error, setError] = useState<string | null>(null);
    const [, startTransition] = useTransition();

    function onPress() {
        const follow = !optimisticIsFollowing;
        setError(null);
        startTransition(async () => {
            setOptimisticIsFollowing(follow);
            try {
                const result = await setFollowing(userId, follow);
                setIsFollowing(result.isFollowing);
            } catch {
                setError(
                    follow
                        ? `Couldn't follow ${name}. Please try again.`
                        : `Couldn't unfollow ${name}. Please try again.`,
                );
            }
        });
    }

    return (
        <div className="flex flex-col items-start gap-2">
            <Button
                variant={optimisticIsFollowing ? "tertiary" : "primary"}
                aria-label={
                    optimisticIsFollowing
                        ? `Unfollow ${name}`
                        : `Follow ${name}`
                }
                onPress={onPress}
            >
                {optimisticIsFollowing ? "Unfollow" : "Follow"}
            </Button>
            {error && (
                <p className="text-sm text-danger" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
