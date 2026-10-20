import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants, Card } from "@heroui/react";
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
            <Card.Content>
                <SignInForm />
            </Card.Content>
            <Card.Footer>
                {/* A link styled as a HeroUI button */}
                <Link
                    href="/sign-up"
                    className={buttonVariants({
                        variant: "secondary",
                        fullWidth: true,
                    })}
                >
                    Create new account
                </Link>
            </Card.Footer>
        </Card>
    );
}
