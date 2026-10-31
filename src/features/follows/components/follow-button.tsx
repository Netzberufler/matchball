"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Button } from "@heroui/react";
import { UserPlus } from "lucide-react";
import { setFollowing } from "@/features/follows/actions/set-following";

// Switches between Follow and Unfollow right away and saves in the
// background; if saving fails, it switches back and shows an error
export function FollowButton({
    userId,
    name,
    isFollowing,
}: {
    userId: string;
    name: string;
    isFollowing: boolean;
}) {
    // Saving refreshes the page, which brings the saved state as
    // isFollowing; until then, the optimistic one is shown
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
                await setFollowing(userId, follow);
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
        <div className="flex flex-col gap-2">
            <Button
                // As wide as its container, the same for both labels
                fullWidth
                variant={optimisticIsFollowing ? "tertiary" : "primary"}
                aria-label={
                    optimisticIsFollowing
                        ? `Unfollow ${name}`
                        : `Follow ${name}`
                }
                onPress={onPress}
            >
                {optimisticIsFollowing ? (
                    "Unfollow"
                ) : (
                    <>
                        <UserPlus className="size-4" aria-hidden />
                        Follow
                    </>
                )}
            </Button>
            {error && (
                <p className="text-sm text-danger" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
