import { describe, expect, it } from "vitest";
import {
    emailSchema,
    loginSchema,
    nameSchema,
    passwordSchema,
    signInFormSchema,
    signInPasswordSchema,
    signUpFormSchema,
    usernameSchema,
} from "@/features/auth/utils/auth-rules";
import { fieldErrors, validator } from "@/lib/form-validation";

const WRONG_LOGIN = "Wrong email, username or password";

describe("emailSchema", () => {
    const check = validator(emailSchema);

    it("trims the address", () => {
        expect(emailSchema.parse("  anna@example.com ")).toBe(
            "anna@example.com",
        );
    });

    it.each(["", "   "])("requires an address (%j)", (value) => {
        expect(check(value)).toBe("Email is required");
    });

    it.each([
        "anna",
        "anna@example",
        "@example.com",
        "anna smith@example.com",
        `${"a".repeat(243)}@example.com`,
    ])("refuses %s", (value) => {
        expect(check(value)).toBe("Enter a valid email address");
    });
});

describe("usernameSchema", () => {
    const check = validator(usernameSchema);

    it("trims and lowercases the username", () => {
        expect(usernameSchema.parse("  Anna_B ")).toBe("anna_b");
    });

    it.each(["abc", "a".repeat(30), "anna_b_99"])("accepts %s", (value) => {
        expect(check(value)).toBeNull();
    });

    it.each([
        ["", "Username is required"],
        ["ab", "Username must be at least 3 characters"],
        ["a".repeat(31), "Username must be at most 30 characters"],
        ["anna-b", "Username may only contain a-z, 0-9 and _"],
        ["anna b", "Username may only contain a-z, 0-9 and _"],
        ["änna", "Username may only contain a-z, 0-9 and _"],
    ])("refuses %j", (value, message) => {
        expect(check(value)).toBe(message);
    });
});

describe("nameSchema", () => {
    const check = validator(nameSchema);

    it("trims the name", () => {
        expect(nameSchema.parse(" Anna Berg ")).toBe("Anna Berg");
    });

    it("accepts 50 characters", () => {
        expect(check("a".repeat(50))).toBeNull();
    });

    it.each([
        ["", "Name is required"],
        ["   ", "Name is required"],
        ["a".repeat(51), "Name must be at most 50 characters"],
    ])("refuses %j", (value, message) => {
        expect(check(value)).toBe(message);
    });
});

describe("passwordSchema", () => {
    const check = validator(passwordSchema);

    it("keeps spaces, which can be part of a password", () => {
        expect(passwordSchema.parse("  secret  ")).toBe("  secret  ");
        expect(check(" ".repeat(8))).toBeNull();
    });

    it("accepts 8 to 128 characters", () => {
        expect(check("a".repeat(8))).toBeNull();
        expect(check("a".repeat(128))).toBeNull();
    });

    it.each([
        ["", "Password is required"],
        ["a".repeat(7), "Password must be at least 8 characters"],
        ["a".repeat(129), "Password must be at most 128 characters"],
    ])("refuses %j", (value, message) => {
        expect(check(value)).toBe(message);
    });
});

describe("signUpFormSchema", () => {
    it("returns the cleaned-up fields", () => {
        expect(
            signUpFormSchema.parse({
                email: " anna@example.com ",
                username: "Anna_B",
                name: " Anna ",
                password: "secret123",
            }),
        ).toEqual({
            email: "anna@example.com",
            username: "anna_b",
            name: "Anna",
            password: "secret123",
        });
    });

    it("treats missing fields as empty", () => {
        const result = signUpFormSchema.safeParse({
            email: null,
            username: null,
            name: null,
            password: null,
        });
        expect(result.error && fieldErrors(result.error)).toEqual({
            email: "Email is required",
            username: "Username is required",
            name: "Name is required",
            password: "Password is required",
        });
    });
});

describe("loginSchema", () => {
    const check = validator(loginSchema);

    it("trims the email or username", () => {
        expect(loginSchema.parse(" anna_b ")).toBe("anna_b");
    });

    it("requires an email or username", () => {
        expect(check(" ")).toBe("Enter your email or username");
    });

    it("refuses overlong text as a wrong login", () => {
        expect(check("a".repeat(255))).toBe(WRONG_LOGIN);
    });
});

describe("signInPasswordSchema", () => {
    const check = validator(signInPasswordSchema);

    it("requires a password", () => {
        expect(check("")).toBe("Enter your password");
    });

    it("accepts a short password, which Better Auth then refuses", () => {
        expect(check("a")).toBeNull();
    });

    it("refuses an overlong password as a wrong login", () => {
        expect(check("a".repeat(129))).toBe(WRONG_LOGIN);
    });
});

describe("signInFormSchema", () => {
    it("treats missing fields as empty", () => {
        const result = signInFormSchema.safeParse({
            login: null,
            password: null,
        });
        expect(result.error && fieldErrors(result.error)).toEqual({
            login: "Enter your email or username",
            password: "Enter your password",
        });
    });
});
