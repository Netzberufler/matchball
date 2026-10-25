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
import { updateProfile } from "@/features/account/actions/update-profile";
import { validateName } from "@/features/auth/utils/auth-rules";

export function ProfileForm({ name }: { name: string }) {
    const [isPending, startTransition] = useTransition();
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        setFieldErrors({});
        setFormError(null);
        setIsSaved(false);

        startTransition(async () => {
            const { error } = await updateProfile(formData);
            if (!error) {
                setIsSaved(true);
            } else if (error.field) {
                setFieldErrors({ [error.field]: error.message });
            } else {
                setFormError(error.message);
            }
        });
    }

    return (
        <Form
            className="flex max-w-md flex-col gap-4"
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
            {isSaved && (
                <Alert status="success">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>Your profile was saved</Alert.Title>
                    </Alert.Content>
                </Alert>
            )}

            <TextField
                variant="secondary"
                isRequired
                name="name"
                autoComplete="name"
                defaultValue={name}
                validate={validateName}
            >
                <Label>Name</Label>
                <Input placeholder="Your full name" />
                <Description>Shown on your profile</Description>
                <FieldError />
            </TextField>

            <Button type="submit" className="self-start" isPending={isPending}>
                Save
            </Button>
        </Form>
    );
}
