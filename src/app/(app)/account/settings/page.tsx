import type { Metadata } from "next";
import { Card } from "@heroui/react";
import { AccountTabs } from "@/features/account/components/account-tabs";

export const metadata: Metadata = {
    title: "Settings",
};

export default function SettingsPage() {
    return (
        <>
            {/* For screen readers; the selected tab shows the page */}
            <h1 className="sr-only">Settings</h1>
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
