import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants, Card } from "@heroui/react";
import { LabeledSeparator } from "@/components/ui/labeled-separator";
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";
import { OAuthError } from "@/features/auth/components/oauth-error";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = {
    title: "Sign In",
};

export default function SignInPage() {
    return (
        <Card className="w-full">
            <Card.Header className="mb-2">
                <Card.Title className="text-base font-semibold">
                    Welcome back
                </Card.Title>
                <Card.Description>
                    Sign in with your email or username.
                </Card.Description>
            </Card.Header>
            <Card.Content className="gap-4">
                {/* Reads ?error=, so it needs a Suspense boundary */}
                <Suspense>
                    <OAuthError />
                </Suspense>
                <SignInForm />
            </Card.Content>
            <LabeledSeparator />
            <Card.Footer className="flex-col gap-3">
                <GoogleSignInButton />
                {/* A link styled as a HeroUI button */}
                <Link
                    href="/sign-up"
                    className={buttonVariants({
                        variant: "outline",
                        fullWidth: true,
                    })}
                >
                    Create new account
                </Link>
            </Card.Footer>
        </Card>
    );
}
