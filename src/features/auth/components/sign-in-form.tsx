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
import {
    loginSchema,
    signInPasswordSchema,
} from "@/features/auth/utils/auth-rules";
import { REDIRECT_PARAM } from "@/features/auth/utils/redirect";
import { validator } from "@/lib/form-validation";

// The same checks signIn runs on the server
const validateLogin = validator(loginSchema);
const validatePassword = validator(signInPasswordSchema);

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
                validate={validateLogin}
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
                validate={validatePassword}
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
