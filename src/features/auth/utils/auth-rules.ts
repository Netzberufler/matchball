// Shared by the auth server config and the auth forms

// Usernames are used for sign-in and in profile URLs
export const USERNAME_PATTERN = /^[a-z0-9_]+$/;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
// name is the display name
export const NAME_MAX_LENGTH = 50;
// Better Auth defaults
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

// A simple format check; Better Auth validates the email again on the server
export function validateEmail(value: string) {
    const email = value.trim();
    if (!email) {
        return "Email is required";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "Enter a valid email address";
    }
    return null;
}

export function validateUsername(value: string) {
    const username = value.trim().toLowerCase();
    if (!username) {
        return "Username is required";
    }
    if (username.length < USERNAME_MIN_LENGTH) {
        return `Username must be at least ${USERNAME_MIN_LENGTH} characters`;
    }
    if (username.length > USERNAME_MAX_LENGTH) {
        return `Username must be at most ${USERNAME_MAX_LENGTH} characters`;
    }
    if (!USERNAME_PATTERN.test(username)) {
        return "Username may only contain a-z, 0-9 and _";
    }
    return null;
}

export function validateName(value: string) {
    const name = value.trim();
    if (!name) {
        return "Name is required";
    }
    if (name.length > NAME_MAX_LENGTH) {
        return `Name must be at most ${NAME_MAX_LENGTH} characters`;
    }
    return null;
}

export function validatePassword(value: string) {
    if (!value) {
        return "Password is required";
    }
    if (value.length < PASSWORD_MIN_LENGTH) {
        return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }
    if (value.length > PASSWORD_MAX_LENGTH) {
        return `Password must be at most ${PASSWORD_MAX_LENGTH} characters`;
    }
    return null;
}
