import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
    APIError,
    createAuthMiddleware,
    getSessionFromCtx,
} from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/prisma/db";

// name is the user's handle and is used in profile URLs
export const NAME_PATTERN = /^[a-z0-9_]+$/;
export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 30;
export const FULL_NAME_MAX_LENGTH = 50;

function nameError(name: string) {
    if (name.length < NAME_MIN_LENGTH) {
        return {
            code: "NAME_TOO_SHORT",
            message: `Name must be at least ${NAME_MIN_LENGTH} characters`,
        };
    }
    if (name.length > NAME_MAX_LENGTH) {
        return {
            code: "NAME_TOO_LONG",
            message: `Name must be at most ${NAME_MAX_LENGTH} characters`,
        };
    }
    if (!NAME_PATTERN.test(name)) {
        return {
            code: "INVALID_NAME",
            message: "Name may only contain a-z, 0-9 and _",
        };
    }
    return null;
}

// BETTER_AUTH_SECRET and BETTER_AUTH_URL are read from the environment
export const auth = betterAuth({
    appName: "Matchball",
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    advanced: {
        database: {
            // Let Prisma generate the ids (UUIDv7, see schema.prisma)
            generateId: false,
        },
    },
    user: {
        additionalFields: {
            fullName: {
                type: "string",
                required: false,
            },
        },
    },
    emailAndPassword: {
        enabled: true,
    },
    hooks: {
        // Normalize and validate name and fullName on sign-up and profile updates
        before: createAuthMiddleware(async (ctx) => {
            if (ctx.path !== "/sign-up/email" && ctx.path !== "/update-user") {
                return;
            }
            const body = { ...ctx.body };

            if (typeof body.name === "string") {
                body.name = body.name.trim().toLowerCase();
                const error = nameError(body.name);
                if (error) {
                    throw new APIError("BAD_REQUEST", error);
                }

                const existing = await prisma.user.findUnique({
                    where: { name: body.name },
                    select: { id: true },
                });
                const currentUserId =
                    ctx.path === "/update-user"
                        ? (await getSessionFromCtx(ctx))?.user.id
                        : undefined;
                if (existing && existing.id !== currentUserId) {
                    throw new APIError("BAD_REQUEST", {
                        code: "NAME_IS_ALREADY_TAKEN",
                        message: "Name is already taken",
                    });
                }
            }

            if (typeof body.fullName === "string") {
                body.fullName = body.fullName.trim();
                if (body.fullName.length > FULL_NAME_MAX_LENGTH) {
                    throw new APIError("BAD_REQUEST", {
                        code: "FULL_NAME_TOO_LONG",
                        message: `Full name must be at most ${FULL_NAME_MAX_LENGTH} characters`,
                    });
                }
            }

            return { context: { body } };
        }),
    },
    // Store an empty fullName as null. This can't happen in the hook above,
    // because Better Auth drops null values when merging a changed body.
    databaseHooks: {
        user: {
            create: {
                before: async (user) => ({
                    data: { ...user, fullName: user.fullName || null },
                }),
            },
            update: {
                before: async (user) => {
                    if (user.fullName === "") {
                        return { data: { fullName: null } };
                    }
                },
            },
        },
    },
    // Must be last: lets server actions set auth cookies
    plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
