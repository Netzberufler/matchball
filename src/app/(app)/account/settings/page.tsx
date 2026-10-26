import type { Metadata } from "next";
import { Card } from "@heroui/react";
import { BackButton } from "@/components/ui/back-button";
import { AccountTabs } from "@/features/account/components/account-tabs";

export const metadata: Metadata = {
    title: "Settings",
};

export default function SettingsPage() {
    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                <BackButton href="/" />
                <h1 className="text-xl font-semibold">Manage your account</h1>
            </div>
            <div className="mb-4">
                <AccountTabs selected="settings" />
            </div>
            {/* TODO: account settings */}
            <Card>
                <Card.Content>
                    <p className="text-muted">
                        Account settings are coming soon.
                    </p>
                </Card.Content>
            </Card>
        </>
    );
}
