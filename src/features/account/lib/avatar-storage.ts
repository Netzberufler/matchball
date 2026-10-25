import "server-only";

import { randomUUID } from "node:crypto";
import { readFile, unlink, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp, { type SharpOptions } from "sharp";

// Uploaded photos are stored on disk, outside public/ (which Next.js only
// serves as it was at build time), and served by app/avatars/[file]/route.ts
const AVATAR_DIR =
    process.env.AVATAR_STORAGE_DIR ??
    path.join(process.cwd(), "storage", "avatars");
const AVATAR_URL_PREFIX = "/avatars/";
// Only names we generate: a random UUID, so photos can't be guessed or
// overwritten, and no path separators, so a name can't leave AVATAR_DIR
const AVATAR_FILE_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/;

const AVATAR_SIZE = 512;
// Formats sharp detected from the file's content
const ACCEPTED_FORMATS = new Set(["png", "jpeg", "webp"]);
// Refuses images that are small files but huge once decoded
// (decompression bombs) before decoding them
const MAX_INPUT_PIXELS = 50_000_000;

export class InvalidAvatarError extends Error {}

// Decodes the upload and encodes a new 512x512 WebP, cropped from the
// centre. Re-encoding drops anything else in the file (EXIF data such as
// GPS location, embedded scripts, trailing data), so only pixels are kept.
export async function processAvatar(input: Buffer) {
    const options: SharpOptions = {
        limitInputPixels: MAX_INPUT_PIXELS,
        // Refuses broken files rather than decoding what it can
        failOn: "error",
    };
    let format: string | undefined;
    try {
        ({ format } = await sharp(input, options).metadata());
    } catch {
        throw new InvalidAvatarError("This file isn't a valid image");
    }
    if (!format || !ACCEPTED_FORMATS.has(format)) {
        throw new InvalidAvatarError("Choose a PNG, JPEG or WebP image");
    }

    try {
        return await sharp(input, options)
            // Applies the EXIF orientation, e.g. of phone photos
            .rotate()
            .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" })
            .webp({ quality: 85 })
            .toBuffer();
    } catch {
        throw new InvalidAvatarError("This image couldn't be read");
    }
}

// Stores a processed photo and returns the URL for user.image
export async function saveAvatar(webp: Buffer) {
    const fileName = `${randomUUID()}.webp`;
    await mkdir(AVATAR_DIR, { recursive: true });
    // "wx" never overwrites an existing file
    await writeFile(path.join(AVATAR_DIR, fileName), webp, { flag: "wx" });
    return `${AVATAR_URL_PREFIX}${fileName}`;
}

// Removes a stored photo by its URL. Does nothing for other URLs, e.g.
// Google profile pictures, or for photos that are already gone.
export async function deleteAvatarFile(imageUrl: string | null | undefined) {
    const fileName = toAvatarFileName(imageUrl);
    if (!fileName) {
        return;
    }
    try {
        await unlink(path.join(AVATAR_DIR, fileName));
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
            throw error;
        }
    }
}

// A stored photo's content, or null if there's no such photo
export async function readAvatar(fileName: string) {
    if (!AVATAR_FILE_PATTERN.test(fileName)) {
        return null;
    }
    try {
        return await readFile(path.join(AVATAR_DIR, fileName));
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            return null;
        }
        throw error;
    }
}

function toAvatarFileName(imageUrl: string | null | undefined) {
    if (!imageUrl?.startsWith(AVATAR_URL_PREFIX)) {
        return null;
    }
    const fileName = imageUrl.slice(AVATAR_URL_PREFIX.length);
    return AVATAR_FILE_PATTERN.test(fileName) ? fileName : null;
}
