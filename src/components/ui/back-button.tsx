"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@heroui/react";
import { canGoBackInApp } from "@/components/layout/navigation-history";

const buttonStyle = { isIconOnly: true, size: "sm", variant: "ghost" } as const;

// Goes back to the previous page if it's part of the app, e.g. the feed the
// user came from. Otherwise (opened directly, in a new tab or from another
// site) it goes to `fallbackHref`. With `href`, it's a link that always goes
// there instead, whichever page came before.
export function BackButton({
    fallbackHref = "/",
    href,
}: {
    fallbackHref?: string;
    href?: string;
}) {
    const router = useRouter();

    if (href) {
        return (
            // A link styled as a HeroUI button
            <Link
                href={href}
                aria-label="Back"
                className={buttonVariants(buttonStyle)}
            >
                <ArrowLeft className="size-5" aria-hidden />
            </Link>
        );
    }

    return (
        <Button
            {...buttonStyle}
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
