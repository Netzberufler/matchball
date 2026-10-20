import { Suspense } from "react";
import type { Metadata } from "next";
import { ProfileFeed } from "@/features/posts/components/feeds";
import { PostListFallback } from "@/features/posts/components/post-list";

export const metadata: Metadata = {
    title: "Profile",
};

export default function ProfilePage() {
    return (
        <>
            <h1 className="text-xl mb-4 font-semibold">Profile</h1>
            <Suspense fallback={<PostListFallback />}>
                <ProfileFeed />
            </Suspense>
        </>
    );
}
