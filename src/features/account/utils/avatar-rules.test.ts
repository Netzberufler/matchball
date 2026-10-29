import { describe, expect, it } from "vitest";
import {
    AVATAR_MAX_BYTES,
    avatarFileSchema,
    avatarUploadSchema,
} from "@/features/account/utils/avatar-rules";
import { validator } from "@/lib/form-validation";

function image(bytes: number, type = "image/png") {
    return new File([new Uint8Array(bytes)], "photo", { type });
}

describe("avatarUploadSchema", () => {
    const check = validator(avatarUploadSchema);

    it("accepts a file up to the size limit, whatever its type", () => {
        expect(check(image(1))).toBeNull();
        expect(check(image(AVATAR_MAX_BYTES, "application/pdf"))).toBeNull();
    });

    it.each([
        ["an empty file", image(0)],
        ["text", "photo.png"],
        ["no file", null],
    ])("refuses %s", (_, value) => {
        expect(check(value)).toBe("Choose an image");
    });

    it("refuses a file over the size limit", () => {
        expect(check(image(AVATAR_MAX_BYTES + 1))).toBe(
            "This image is too large",
        );
    });
});

describe("avatarFileSchema", () => {
    const check = validator(avatarFileSchema);

    it.each(["image/png", "image/jpeg", "image/webp"])("accepts %s", (type) => {
        expect(check(image(1, type))).toBeNull();
    });

    it("refuses other types", () => {
        expect(check(image(1, "image/gif"))).toBe(
            "Choose a PNG, JPEG or WebP image",
        );
    });

    it("refuses an empty file", () => {
        expect(check(image(0))).toBe("This file is empty");
    });

    it("refuses a file over the size limit", () => {
        expect(check(image(AVATAR_MAX_BYTES + 1))).toBe(
            "Choose an image of at most 5 MB",
        );
    });
});
