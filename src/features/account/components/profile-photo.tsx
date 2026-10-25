"use client";

import { useRef, useState, useTransition } from "react";
import { AlertDialog, Button } from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { removeAvatar, uploadAvatar } from "@/features/account/actions/avatar";
import {
    AVATAR_ACCEPTED_TYPES,
    validateAvatarFile,
} from "@/features/account/utils/avatar-rules";

// The signed-in user's avatar, name and username, laid out like the user
// menu in the sidebar, with buttons to upload or delete their photo
export function ProfilePhoto({
    name,
    username,
    image,
}: {
    name: string;
    username: string;
    image?: string | null;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, startUpload] = useTransition();
    const [isDeleting, startDelete] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const isBusy = isUploading || isDeleting;

    function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        // Lets the same file be picked again, e.g. after an error
        event.target.value = "";
        if (!file) {
            return;
        }

        const fileError = validateAvatarFile(file);
        setError(fileError);
        if (fileError) {
            return;
        }

        const formData = new FormData();
        formData.append("photo", file);
        startUpload(async () => {
            const { error } = await uploadAvatar(formData);
            setError(error);
        });
    }

    // From the confirm dialog, which stays open until the photo is deleted
    function onDelete() {
        setError(null);
        startDelete(async () => {
            await removeAvatar();
            setIsConfirmOpen(false);
        });
    }

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface-secondary p-4">
            <UserAvatar name={name} image={image} />
            <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium text-foreground">
                    {name}
                </span>
                <span className="truncate text-sm text-muted">@{username}</span>
            </div>
            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="primary"
                    isPending={isUploading}
                    isDisabled={isBusy}
                    onPress={() => fileInputRef.current?.click()}
                >
                    {image ? "Change photo" : "Add photo"}
                </Button>
                {/* Asks first, so a photo isn't deleted by accident */}
                <AlertDialog
                    isOpen={isConfirmOpen}
                    onOpenChange={setIsConfirmOpen}
                >
                    <Button
                        size="sm"
                        variant="danger-soft"
                        isDisabled={isBusy || !image}
                    >
                        Delete photo
                    </Button>
                    <AlertDialog.Backdrop>
                        <AlertDialog.Container size="sm">
                            <AlertDialog.Dialog>
                                <AlertDialog.Header>
                                    <AlertDialog.Icon status="danger" />
                                    <AlertDialog.Heading>
                                        Delete your photo?
                                    </AlertDialog.Heading>
                                </AlertDialog.Header>
                                <AlertDialog.Body>
                                    <p>
                                        Your initials will be shown instead. You
                                        can add a new photo at any time.
                                    </p>
                                </AlertDialog.Body>
                                <AlertDialog.Footer>
                                    <Button
                                        variant="tertiary"
                                        isDisabled={isDeleting}
                                        onPress={() => setIsConfirmOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="danger"
                                        isPending={isDeleting}
                                        onPress={onDelete}
                                    >
                                        Delete photo
                                    </Button>
                                </AlertDialog.Footer>
                            </AlertDialog.Dialog>
                        </AlertDialog.Container>
                    </AlertDialog.Backdrop>
                </AlertDialog>
            </div>
            {/* Opened by the button above; not a form field, so it's
                never sent with the profile form */}
            <input
                ref={fileInputRef}
                type="file"
                accept={AVATAR_ACCEPTED_TYPES.join(",")}
                className="hidden"
                tabIndex={-1}
                aria-hidden
                onChange={onFileChange}
            />
            {error && (
                <p role="alert" className="w-full text-sm text-danger">
                    {error}
                </p>
            )}
        </div>
    );
}
