import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants, Card } from "@heroui/react";
import { LabeledSeparator } from "@/components/ui/labeled-separator";
import { ResetWhenHidden } from "@/components/ui/reset-when-hidden";
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export const metadata: Metadata = {
    title: "Sign Up",
};

export default function SignUpPage() {
    return (
        <Card className="w-full">
            <Card.Header className="mb-2">
                <Card.Title className="text-base font-semibold">
                    Create your account
                </Card.Title>
                <Card.Description>
                    Join myMatchball to find matches, tournaments and courts.
                </Card.Description>
            </Card.Header>
            <Card.Content>
                <ResetWhenHidden>
                    <SignUpForm />
                </ResetWhenHidden>
            </Card.Content>
            <LabeledSeparator />
            <Card.Footer className="flex-col gap-3">
                <GoogleSignInButton label="Sign up with Google" />
                {/* A link styled as a HeroUI button */}
                <Link
                    href="/sign-in"
                    className={buttonVariants({
                        variant: "outline",
                        fullWidth: true,
                    })}
                >
                    Sign in to existing account
                </Link>
            </Card.Footer>
        </Card>
    );
}
