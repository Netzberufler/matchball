import { Suspense } from "react";
import type { Metadata } from "next";
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
            {/* For screen readers; the selected tab shows the page */}
            <h1 className="sr-only">Edit profile</h1>
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
