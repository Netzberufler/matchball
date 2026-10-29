import * as z from "zod/mini";
import { describe, expect, it } from "vitest";
import {
    fieldErrors,
    firstError,
    formFields,
    formText,
    validator,
} from "@/lib/form-validation";

// Fails with two problems for `a` and one for `b`
const twoFieldsSchema = z.object({
    a: z
        .string()
        .check(z.minLength(3, "a is short"), z.regex(/x/, "a has no x")),
    b: z.string("b is required"),
});

function twoFieldsError() {
    const result = twoFieldsSchema.safeParse({ a: "", b: null });
    if (result.success) {
        throw new Error("Expected the data to be refused");
    }
    return result.error;
}

// Fails with a problem for the whole object, not one field
function wholeFormError() {
    const result = z
        .object({ a: z.string() })
        .check(z.refine(() => false, "Something is off"))
        .safeParse({ a: "" });
    if (result.success) {
        throw new Error("Expected the data to be refused");
    }
    return result.error;
}

describe("formText", () => {
    const schema = formText(z.string().check(z.minLength(1, "Required")));

    it("passes text on", () => {
        expect(schema.parse("anna")).toBe("anna");
    });

    it("treats a missing field as empty", () => {
        expect(validator(schema)(null)).toBe("Required");
        expect(validator(schema)(undefined)).toBe("Required");
    });

    it("refuses a file", () => {
        expect(schema.safeParse(new File(["a"], "a.txt")).success).toBe(false);
    });
});

describe("formFields", () => {
    it("reads only the named fields, with null for a missing one", () => {
        const formData = new FormData();
        formData.set("name", "Anna");
        formData.set("role", "admin");
        expect(formFields(formData, ["name", "bio"])).toEqual({
            name: "Anna",
            bio: null,
        });
    });
});

describe("fieldErrors", () => {
    it("gives the first problem of each field", () => {
        expect(fieldErrors(twoFieldsError())).toEqual({
            a: "a is short",
            b: "b is required",
        });
    });

    it("puts a problem with the whole form under an empty name", () => {
        expect(fieldErrors(wholeFormError())).toEqual({
            "": "Something is off",
        });
    });
});

describe("firstError", () => {
    it("gives the first problem's field and message", () => {
        expect(firstError(twoFieldsError())).toEqual({
            field: "a",
            message: "a is short",
        });
    });

    it("has no field for a problem with the whole form", () => {
        expect(firstError(wholeFormError())).toEqual({
            field: undefined,
            message: "Something is off",
        });
    });

    it("falls back to a general message", () => {
        expect(firstError(new z.core.$ZodError([]))).toEqual({
            field: undefined,
            message: "Please check your input",
        });
    });
});

describe("validator", () => {
    const check = validator(z.string().check(z.minLength(3, "Too short")));

    it("is null for a valid value", () => {
        expect(check("anna")).toBeNull();
    });

    it("gives the first problem's message", () => {
        expect(check("an")).toBe("Too short");
    });
});
