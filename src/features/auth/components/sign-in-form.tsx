"use client";

import { useState, useTransition } from "react";
import {
    Alert,
    Button,
    FieldError,
    Form,
    Input,
    Label,
    TextField,
} from "@heroui/react";
import { signIn } from "@/features/auth/actions/sign-in";
import { REDIRECT_PARAM } from "@/features/auth/utils/redirect";

export function SignInForm() {
    const [isPending, startTransition] = useTransition();
    const [formError, setFormError] = useState<string | null>(null);

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        // Set by src/proxy.ts; read here so the page itself stays static
        const redirectTo = new URLSearchParams(window.location.search).get(
            REDIRECT_PARAM,
        );
        if (redirectTo) {
            formData.set(REDIRECT_PARAM, redirectTo);
        }

        setFormError(null);

        startTransition(async () => {
            // Redirects on success, so only errors come back
            const { error } = await signIn(formData);
            setFormError(error.message);
        });
    }

    return (
        <Form className="flex flex-col gap-4" onSubmit={onSubmit}>
            {formError && (
                <Alert status="danger">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>{formError}</Alert.Title>
                    </Alert.Content>
                </Alert>
            )}

            <TextField
                variant="secondary"
                isRequired
                name="login"
                autoComplete="username"
                validate={(value) =>
                    value.trim() ? null : "Enter your email or username"
                }
            >
                <Label>Email or username</Label>
                <Input placeholder="you@example.com" />
                <FieldError />
            </TextField>

            <TextField
                variant="secondary"
                isRequired
                name="password"
                type="password"
                autoComplete="current-password"
                validate={(value) => (value ? null : "Enter your password")}
            >
                <Label>Password</Label>
                <Input />
                <FieldError />
            </TextField>

            <Button type="submit" fullWidth isPending={isPending}>
                Sign in
            </Button>
        </Form>
    );
}
