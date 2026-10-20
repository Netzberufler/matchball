"use client";

import { useState, useTransition } from "react";
import { Button } from "@heroui/react";
import { signInWithGoogle } from "@/features/auth/actions/sign-in-with-google";
import { REDIRECT_PARAM } from "@/features/auth/utils/redirect";

// Signs in existing users and creates an account for new ones, so the
// sign-up page can use the same button with a different label
export function GoogleSignInButton({
    label = "Sign in with Google",
}: {
    label?: string;
}) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function onPress() {
        // Set by src/proxy.ts; read here so the page itself stays static
        const redirectTo = new URLSearchParams(window.location.search).get(
            REDIRECT_PARAM,
        );
        setError(null);
        startTransition(async () => {
            // Redirects to Google on success, so only errors come back
            const result = await signInWithGoogle(redirectTo);
            setError(result.error.message);
        });
    }

    return (
        <div className="flex w-full flex-col gap-2">
            <Button
                variant="tertiary"
                fullWidth
                isPending={isPending}
                onPress={onPress}
            >
                <GoogleIcon />
                {label}
            </Button>
            {error && (
                <p className="text-center text-sm text-danger">{error}</p>
            )}
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden>
            <path
                fill="#4285F4"
                d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.5 5.5 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.65z"
            />
            <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24z"
            />
            <path
                fill="#FBBC05"
                d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.28a12 12 0 0 0 0 10.78l4.01-3.1z"
            />
            <path
                fill="#EA4335"
                d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.94 11.94 0 0 0 12 0 12 12 0 0 0 1.28 6.61l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77z"
            />
        </svg>
    );
}
