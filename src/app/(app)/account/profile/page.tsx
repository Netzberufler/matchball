import { Suspense } from "react";
import type { Metadata } from "next";
import { BackButton } from "@/components/ui/back-button";
import { AccountTabs } from "@/features/account/components/account-tabs";
import {
    EditProfile,
    EditProfileFallback,
} from "@/features/account/components/edit-profile";

export const metadata: Metadata = {
    title: "Edit profile",
};

export default function EditProfilePage() {
    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                <BackButton href="/" />
                <h1 className="text-xl font-semibold">Manage your account</h1>
            </div>
            <div className="mb-4">
                <AccountTabs selected="profile" />
            </div>
            {/* Reads the session at request time. Both render a card; the
                form's success message goes above it. */}
            <Suspense fallback={<EditProfileFallback />}>
                <EditProfile />
            </Suspense>
        </>
    );
}
