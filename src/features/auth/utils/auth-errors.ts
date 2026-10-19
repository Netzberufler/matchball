// Turns Better Auth API errors into a message for a form field, or for the
// whole form when no field is to blame

type AuthError = {
    code?: string;
    message?: string;
};

export type AuthFormError = {
    field?: "email" | "username" | "name" | "password";
    message: string;
};

const fieldByCode: Record<string, AuthFormError["field"]> = {
    INVALID_EMAIL: "email",
    USER_ALREADY_EXISTS: "email",
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "email",
    USERNAME_REQUIRED: "username",
    INVALID_USERNAME: "username",
    USERNAME_TOO_SHORT: "username",
    USERNAME_TOO_LONG: "username",
    USERNAME_IS_ALREADY_TAKEN: "username",
    NAME_REQUIRED: "name",
    NAME_TOO_LONG: "name",
    PASSWORD_TOO_SHORT: "password",
    PASSWORD_TOO_LONG: "password",
};

const messageByCode: Record<string, string> = {
    USER_ALREADY_EXISTS: "An account with this email already exists",
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
        "An account with this email already exists",
    USERNAME_IS_ALREADY_TAKEN: "This username is already taken",
    INVALID_EMAIL_OR_PASSWORD: "Wrong email, username or password",
    INVALID_USERNAME_OR_PASSWORD: "Wrong email, username or password",
};

export function toAuthFormError(error: AuthError): AuthFormError {
    const code = error.code ?? "";
    return {
        field: fieldByCode[code],
        message:
            messageByCode[code] ??
            error.message ??
            "Something went wrong. Please try again.",
    };
}
