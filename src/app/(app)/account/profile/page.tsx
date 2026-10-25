import { Suspense } from "react";
import type { Metadata } from "next";
import { BackButton } from "@/components/ui/back-button";
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
                <BackButton />
                <h1 className="text-xl font-semibold">Edit profile</h1>
            </div>
            {/* Reads the session at request time */}
            <Suspense fallback={<EditProfileFallback />}>
                <EditProfile />
            </Suspense>
        </>
    );
}
