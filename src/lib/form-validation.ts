// Zod helpers for forms, shared by the forms in the browser and the server
// actions that receive them. Schemas the browser also uses are written with
// zod/mini, which keeps the client bundle small and checks the same on the
// server.
import * as z from "zod/mini";

// A form field as text. FormData gives null for a missing field, which
// counts as empty, and a File for an upload, which `schema` then refuses as
// not being a string.
export function formText<T extends z.ZodMiniType>(schema: T) {
    return z.pipe(
        z.transform((value: unknown): unknown => value ?? ""),
        // Takes the transform's output, whatever was sent; keeps `schema`'s
        // output type
        schema as unknown as z.ZodMiniType<z.output<T>, unknown>,
    );
}

// Only the named fields of `formData`, for a form schema to check. Whatever
// else was sent is never read.
export function formFields(formData: FormData, names: readonly string[]) {
    return Object.fromEntries(names.map((name) => [name, formData.get(name)]));
}

// The first problem with each field, by field name, as HeroUI's Form takes
// them in `validationErrors`
export function fieldErrors(error: z.core.$ZodError): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const issue of error.issues) {
        const field = String(issue.path[0] ?? "");
        errors[field] ??= issue.message;
    }
    return errors;
}

// The first problem Zod found: the field it's about (the top of its path)
// and its message
export function firstError(error: z.core.$ZodError) {
    const issue = error.issues[0];
    return {
        field: issue?.path[0] === undefined ? undefined : String(issue.path[0]),
        message: issue?.message ?? "Please check your input",
    };
}

// A field's `validate` function for HeroUI from its schema: the first
// problem's message, or null when the value is fine
export function validator(schema: z.ZodMiniType) {
    return (value: unknown) => {
        const result = schema.safeParse(value);
        return result.success
            ? null
            : (result.error.issues[0]?.message ?? "Please check this field");
    };
}
