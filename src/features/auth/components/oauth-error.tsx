"use client";

import { useSearchParams } from "next/navigation";
import { Alert } from "@heroui/react";

// Better Auth redirects to /sign-in?error=<code> when Google sign-in fails
const messages: Record<string, string> = {
    access_denied: "Google sign-in was cancelled.",
    account_not_linked:
        "An account with this email already exists. Sign in with your email or username and password instead.",
};

export function OAuthError() {
    const error = useSearchParams().get("error");
    if (!error) {
        return null;
    }

    return (
        <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
                <Alert.Title>
                    {messages[error] ??
                        "Google sign-in failed. Please try again."}
                </Alert.Title>
            </Alert.Content>
        </Alert>
    );
}
