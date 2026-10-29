import { describe, expect, it } from "vitest";
import { toAuthFormError } from "@/features/auth/utils/auth-errors";

describe("toAuthFormError", () => {
    it.each([
        [
            "USER_ALREADY_EXISTS",
            "email",
            "An account with this email already exists",
        ],
        [
            "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
            "email",
            "An account with this email already exists",
        ],
        [
            "USERNAME_IS_ALREADY_TAKEN",
            "username",
            "This username is already taken",
        ],
    ])("gives %s its own message at the %s field", (code, field, message) => {
        expect(toAuthFormError({ code, message: "From Better Auth" })).toEqual({
            field,
            message,
        });
    });

    it.each([
        ["INVALID_EMAIL", "email"],
        ["USERNAME_REQUIRED", "username"],
        ["INVALID_USERNAME", "username"],
        ["USERNAME_TOO_SHORT", "username"],
        ["USERNAME_TOO_LONG", "username"],
        ["NAME_REQUIRED", "name"],
        ["NAME_TOO_LONG", "name"],
        ["PASSWORD_TOO_SHORT", "password"],
        ["PASSWORD_TOO_LONG", "password"],
    ])("shows Better Auth's message for %s at the %s field", (code, field) => {
        expect(toAuthFormError({ code, message: "From Better Auth" })).toEqual({
            field,
            message: "From Better Auth",
        });
    });

    it.each(["INVALID_EMAIL_OR_PASSWORD", "INVALID_USERNAME_OR_PASSWORD"])(
        "shows %s for the whole form without saying which part is wrong",
        (code) => {
            expect(toAuthFormError({ code })).toEqual({
                field: undefined,
                message: "Wrong email, username or password",
            });
        },
    );

    it("shows Better Auth's message for the whole form for other codes", () => {
        expect(
            toAuthFormError({
                code: "TOO_MANY_REQUESTS",
                message: "Slow down",
            }),
        ).toEqual({ field: undefined, message: "Slow down" });
    });

    it("falls back to a general message", () => {
        expect(toAuthFormError({})).toEqual({
            field: undefined,
            message: "Something went wrong. Please try again.",
        });
    });
});
