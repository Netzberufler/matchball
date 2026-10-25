import Link from "next/link";
import type { Metadata } from "next";
import { buttonVariants } from "@heroui/react";
import { BackButton } from "@/components/ui/back-button";
import { ACCOUNT_PROFILE_PATH } from "@/features/account/utils/account-path";

export const metadata: Metadata = {
    title: "Settings",
};

export default function SettingsPage() {
    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                <BackButton />
                <h1 className="text-xl font-semibold">Settings</h1>
            </div>
            <p className="text-muted">Manage your account.</p>
            {/* A link styled as a HeroUI button */}
            <Link
                href={ACCOUNT_PROFILE_PATH}
                className={`mt-4 ${buttonVariants({ variant: "tertiary" })}`}
            >
                Edit profile
            </Link>
        </>
    );
}
