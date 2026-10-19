import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@heroui/react";
import { AuthTabs } from "@/features/auth/components/auth-tabs";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = {
    title: "Sign In",
};

export default function SignInPage() {
    return (
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <AuthTabs />
            <Card className="w-full">
                <Card.Header className="mb-2">
                    <Card.Title className="text-base font-semibold">
                        Welcome back
                    </Card.Title>
                    <Card.Description>
                        Sign in with your email or username.
                    </Card.Description>
                </Card.Header>
                <Card.Content>
                    <SignInForm />
                </Card.Content>
                <Card.Footer className="justify-center text-sm text-muted">
                    New to myMatchball?&nbsp;
                    <Link
                        href="/sign-up"
                        className="font-medium text-accent-soft-foreground underline hover:no-underline"
                    >
                        Create an account
                    </Link>
                </Card.Footer>
            </Card>
        </div>
    );
}
