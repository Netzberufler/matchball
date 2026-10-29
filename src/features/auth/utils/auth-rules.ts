// Shared by the auth server config, the auth forms and their actions
import * as z from "zod/mini";
import { formText } from "@/lib/form-validation";

// Usernames are used for sign-in and in profile URLs
export const USERNAME_PATTERN = /^[a-z0-9_]+$/;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
// name is the display name
export const NAME_MAX_LENGTH = 50;
// Better Auth defaults. The maximum also keeps huge passwords away from
// password hashing.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
// The longest an email address can be (RFC 5321)
const EMAIL_MAX_LENGTH = 254;

// A simple format check; Better Auth validates the email again on the server
export const emailSchema = z
    .string("Enter a valid email address")
    .check(
        z.trim(),
        z.minLength(1, "Email is required"),
        z.maxLength(EMAIL_MAX_LENGTH, "Enter a valid email address"),
        z.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"),
    );

// Lowercased, as Better Auth stores it
export const usernameSchema = z
    .string("Username is required")
    .check(
        z.trim(),
        z.toLowerCase(),
        z.minLength(1, "Username is required"),
        z.minLength(
            USERNAME_MIN_LENGTH,
            `Username must be at least ${USERNAME_MIN_LENGTH} characters`,
        ),
        z.maxLength(
            USERNAME_MAX_LENGTH,
            `Username must be at most ${USERNAME_MAX_LENGTH} characters`,
        ),
        z.regex(USERNAME_PATTERN, "Username may only contain a-z, 0-9 and _"),
    );

export const nameSchema = z
    .string("Name is required")
    .check(
        z.trim(),
        z.minLength(1, "Name is required"),
        z.maxLength(
            NAME_MAX_LENGTH,
            `Name must be at most ${NAME_MAX_LENGTH} characters`,
        ),
    );

// Not trimmed: spaces can be part of a password
export const passwordSchema = z
    .string("Password is required")
    .check(
        z.minLength(1, "Password is required"),
        z.minLength(
            PASSWORD_MIN_LENGTH,
            `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
        ),
        z.maxLength(
            PASSWORD_MAX_LENGTH,
            `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
        ),
    );

export const SIGN_UP_FIELDS = ["email", "username", "name", "password"];

export const signUpFormSchema = z.object({
    email: formText(emailSchema),
    username: formText(usernameSchema),
    name: formText(nameSchema),
    password: formText(passwordSchema),
});

// Sign-in only checks that something sensible was entered; whether it's
// right is up to Better Auth
export const loginSchema = z
    .string("Enter your email or username")
    .check(
        z.trim(),
        z.minLength(1, "Enter your email or username"),
        z.maxLength(EMAIL_MAX_LENGTH, "Wrong email, username or password"),
    );

export const signInPasswordSchema = z
    .string("Enter your password")
    .check(
        z.minLength(1, "Enter your password"),
        z.maxLength(PASSWORD_MAX_LENGTH, "Wrong email, username or password"),
    );

export const SIGN_IN_FIELDS = ["login", "password"];

export const signInFormSchema = z.object({
    login: formText(loginSchema),
    password: formText(signInPasswordSchema),
});
