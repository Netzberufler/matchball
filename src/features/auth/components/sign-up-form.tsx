"use client";

import { useState, useTransition } from "react";
import {
    Alert,
    Button,
    Description,
    FieldError,
    Form,
    Input,
    Label,
    TextField,
} from "@heroui/react";
import { signUp } from "@/features/auth/actions/sign-up";
import {
    USERNAME_MAX_LENGTH,
    validateEmail,
    validateName,
    validatePassword,
    validateUsername,
} from "@/features/auth/utils/auth-rules";

export function SignUpForm() {
    const [username, setUsername] = useState("");
    const [isPending, startTransition] = useTransition();
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string | null>(null);

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        setFieldErrors({});
        setFormError(null);

        startTransition(async () => {
            // Redirects on success, so only errors come back
            const { error } = await signUp(formData);
            if (error.field) {
                setFieldErrors({ [error.field]: error.message });
            } else {
                setFormError(error.message);
            }
        });
    }

    return (
        <Form
            className="flex flex-col gap-4"
            validationErrors={fieldErrors}
            onSubmit={onSubmit}
        >
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
                name="email"
                type="email"
                autoComplete="email"
                validate={validateEmail}
            >
                <Label>Email</Label>
                <Input placeholder="Your email address" />
                <FieldError />
            </TextField>

            <TextField
                variant="secondary"
                isRequired
                name="username"
                autoComplete="username"
                value={username}
                // Usernames are stored in lowercase
                onChange={(value) => setUsername(value.toLowerCase())}
                validate={validateUsername}
            >
                <Label>Username</Label>
                <Input placeholder="Your username used in URLs and tagging" />
                <Description>
                    Up to {USERNAME_MAX_LENGTH} characters: a-z, 0-9 and _
                </Description>
                <FieldError />
            </TextField>

            <TextField
                variant="secondary"
                isRequired
                name="name"
                autoComplete="name"
                validate={validateName}
            >
                <Label>Name</Label>
                <Input placeholder="Your full name" />
                <Description>Shown on your profile</Description>
                <FieldError />
            </TextField>

            <TextField
                variant="secondary"
                isRequired
                name="password"
                type="password"
                autoComplete="new-password"
                validate={validatePassword}
            >
                <Label>Password</Label>
                <Input />
                <FieldError />
            </TextField>

            <Button type="submit" fullWidth isPending={isPending}>
                Create account
            </Button>
        </Form>
    );
}
