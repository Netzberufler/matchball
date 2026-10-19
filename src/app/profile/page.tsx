import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <>
      <h1 className="text-xl mb-4 font-semibold">Profile</h1>
      <p className="text-muted">Manage your player profile and settings.</p>
    </>
  );
}
