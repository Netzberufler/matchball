"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@heroui/react";

// Reloads the page's server data. The feed gets a fresh first page and adds
// its new posts at the top (see PostFeed); loaded posts stay visible.
export function RefreshFeedButton() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    return (
        <Button
            isIconOnly
            size="sm"
            variant="tertiary"
            aria-label="Refresh posts"
            isPending={isPending}
            onPress={() => startTransition(() => router.refresh())}
        >
            <RefreshCw
                className={`size-4 ${isPending ? "animate-spin" : ""}`}
                aria-hidden
            />
        </Button>
    );
}
