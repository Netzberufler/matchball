import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@heroui/react";
import { AuthTabs } from "@/features/auth/components/auth-tabs";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export const metadata: Metadata = {
    title: "Sign Up",
};

export default function SignUpPage() {
    return (
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <AuthTabs />
            <Card className="w-full">
                <Card.Header className="mb-2">
                    <Card.Title className="text-base font-semibold">
                        Create your account
                    </Card.Title>
                    <Card.Description>
                        Join myMatchball to find matches, tournaments and
                        courts.
                    </Card.Description>
                </Card.Header>
                <Card.Content>
                    <SignUpForm />
                </Card.Content>
                <Card.Footer className="justify-center text-sm text-muted">
                    Already have an account?&nbsp;
                    <Link
                        href="/sign-in"
                        className="font-medium text-accent-soft-foreground underline hover:no-underline"
                    >
                        Sign in
                    </Link>
                </Card.Footer>
            </Card>
        </div>
    );
}
