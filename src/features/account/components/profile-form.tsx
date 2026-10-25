"use client";

import { useState, useTransition } from "react";
import {
    Alert,
    Button,
    Card,
    Description,
    FieldError,
    Form,
    Input,
    Label,
    TextArea,
    TextField,
} from "@heroui/react";
import { updateProfile } from "@/features/account/actions/update-profile";
import {
    BIO_MAX_LENGTH,
    validateBio,
} from "@/features/account/utils/profile-rules";
import { validateName } from "@/features/auth/utils/auth-rules";

// The form in a card, with the success message above the card. children is
// shown in the card above the form.
export function ProfileForm({
    name,
    username,
    bio,
    children,
}: {
    name: string;
    username: string;
    bio: string | null;
    children: React.ReactNode;
}) {
    // Controlled for the character count
    const [bioValue, setBioValue] = useState(bio ?? "");
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
        <div className="flex flex-col gap-4">
            {isSaved && (
                // Tinted and flat, so it doesn't look like another card
                <Alert
                    status="success"
                    className="rounded-xl bg-success-soft px-3 py-2 shadow-none"
                >
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>Your profile was saved</Alert.Title>
                    </Alert.Content>
                </Alert>
            )}
            <Card>
                <Card.Content className="flex flex-col gap-6">
                    {children}
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

                        {/* Only shown: without a name, and disabled, it
                            isn't part of the form data */}
                        <TextField
                            variant="secondary"
                            isDisabled
                            value={username}
                        >
                            <Label>Username</Label>
                            <Input />
                            <Description>
                                Usernames can&apos;t be changed
                            </Description>
                        </TextField>

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

                        <TextField
                            variant="secondary"
                            name="bio"
                            value={bioValue}
                            onChange={setBioValue}
                            maxLength={BIO_MAX_LENGTH}
                            validate={validateBio}
                        >
                            <Label>Bio</Label>
                            <TextArea
                                rows={3}
                                className="resize-none"
                                placeholder="A few words about you"
                            />
                            <div className="flex justify-between gap-3">
                                <Description>Shown on your profile</Description>
                                <Description className="tabular-nums">
                                    {bioValue.length}/{BIO_MAX_LENGTH}
                                </Description>
                            </div>
                            <FieldError />
                        </TextField>

                        <Button
                            type="submit"
                            className="self-start"
                            isPending={isPending}
                        >
                            Save
                        </Button>
                    </Form>
                </Card.Content>
            </Card>
        </div>
    );
}
