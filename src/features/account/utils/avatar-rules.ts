// Shared by the photo upload button and the upload action
import * as z from "zod/mini";

// The upload as sent; it's cropped and compressed on the server
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_MAX_SIZE_LABEL = "5 MB";
// What the file picker offers. The server checks the file's content, not
// the type the browser reports.
export const AVATAR_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

// The upload as the server takes it: a non-empty file of at most
// AVATAR_MAX_BYTES. Whether it's really an image is checked by decoding it
// (see lib/avatar-storage.ts), not by the type the browser reports.
export const avatarUploadSchema = z
    .file("Choose an image")
    .check(
        z.minSize(1, "Choose an image"),
        z.maxSize(AVATAR_MAX_BYTES, "This image is too large"),
    );

// The picked file in the browser, for quick feedback before uploading: also
// one of the accepted types
export const avatarFileSchema = z
    .file("Choose an image")
    .check(
        z.mime(AVATAR_ACCEPTED_TYPES, "Choose a PNG, JPEG or WebP image"),
        z.minSize(1, "This file is empty"),
        z.maxSize(
            AVATAR_MAX_BYTES,
            `Choose an image of at most ${AVATAR_MAX_SIZE_LABEL}`,
        ),
    );
