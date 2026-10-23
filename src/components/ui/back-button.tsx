"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@heroui/react";
import { canGoBackInApp } from "@/components/layout/navigation-history";

// Goes back to the previous page if it's part of the app, e.g. the feed the
// user came from. Otherwise (opened directly, in a new tab or from another
// site) it goes to `fallbackHref`.
export function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
    const router = useRouter();

    return (
        <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label="Back"
            onPress={() => {
                if (canGoBackInApp()) {
                    router.back();
                } else {
                    router.push(fallbackHref);
                }
            }}
        >
            <ArrowLeft className="size-5" aria-hidden />
        </Button>
    );
}
