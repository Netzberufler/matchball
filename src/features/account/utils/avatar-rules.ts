// Shared by the photo upload button and the upload action

// The upload as sent; it's cropped and compressed on the server
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_MAX_SIZE_LABEL = "5 MB";
// What the file picker offers. The server checks the file's content, not
// the type the browser reports.
export const AVATAR_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function validateAvatarFile(file: File) {
    if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) {
        return "Choose a PNG, JPEG or WebP image";
    }
    if (file.size === 0) {
        return "This file is empty";
    }
    if (file.size > AVATAR_MAX_BYTES) {
        return `Choose an image of at most ${AVATAR_MAX_SIZE_LABEL}`;
    }
    return null;
}
