import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@heroui/react";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = {
    title: "Sign In",
};

export default function SignInPage() {
    return (
        <Card className="mx-auto w-full max-w-md">
            <Card.Header>
                <Card.Title>Welcome back</Card.Title>
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
                    className="font-medium text-accent hover:underline"
                >
                    Create an account
                </Link>
            </Card.Footer>
        </Card>
    );
}
