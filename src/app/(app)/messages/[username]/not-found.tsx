import Link from "next/link";
import { buttonVariants } from "@heroui/react";
import { MESSAGES_PATH } from "@/features/messages/utils/messages-path";

export default function ConversationNotFound() {
    return (
        <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-2 text-center">
            {/* The page's only heading: this replaces the whole page */}
            <h1 className="text-xl font-semibold">
                You can&apos;t message this account
            </h1>
            <p className="text-muted">
                It doesn&apos;t exist, or it&apos;s your own.
            </p>
            {/* A link styled as a HeroUI button */}
            <Link href={MESSAGES_PATH} className={`mt-4 ${buttonVariants()}`}>
                Back to Messages
            </Link>
        </div>
    );
}
