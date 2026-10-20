import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins/username";
import {
    NAME_MAX_LENGTH,
    USERNAME_MAX_LENGTH,
    USERNAME_MIN_LENGTH,
    USERNAME_PATTERN,
} from "@/features/auth/utils/auth-rules";
import { generateUsername } from "@/features/auth/lib/username";
import { prisma } from "@/prisma/db";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
export const isGoogleSignInEnabled = Boolean(
    googleClientId && googleClientSecret,
);

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
    emailAndPassword: {
        enabled: true,
    },
    // Google redirects back to /api/auth/callback/google
    socialProviders:
        googleClientId && googleClientSecret
            ? {
                  google: {
                      clientId: googleClientId,
                      clientSecret: googleClientSecret,
                      // Always let users pick which Google account to use
                      prompt: "select_account",
                  },
              }
            : {},
    databaseHooks: {
        user: {
            create: {
                // Google provides no username and a name of any length
                before: async (user) => {
                    const username =
                        typeof user.username === "string" && user.username
                            ? user.username
                            : await generateUsername(user.email ?? "");
                    const name = (user.name?.trim() || username).slice(
                        0,
                        NAME_MAX_LENGTH,
                    );
                    return { data: { ...user, username, name } };
                },
            },
        },
    },
    hooks: {
        // The username plugin treats username as optional, and Better Auth
        // accepts any name string, so check both on sign-up and profile updates
        before: createAuthMiddleware(async (ctx) => {
            if (ctx.path !== "/sign-up/email" && ctx.path !== "/update-user") {
                return;
            }
            const body = { ...ctx.body };

            if (ctx.path === "/sign-up/email" && !body.username) {
                throw new APIError("BAD_REQUEST", {
                    code: "USERNAME_REQUIRED",
                    message: "Username is required",
                });
            }

            if (typeof body.name === "string") {
                body.name = body.name.trim();
                if (!body.name) {
                    throw new APIError("BAD_REQUEST", {
                        code: "NAME_REQUIRED",
                        message: "Name is required",
                    });
                }
                if (body.name.length > NAME_MAX_LENGTH) {
                    throw new APIError("BAD_REQUEST", {
                        code: "NAME_TOO_LONG",
                        message: `Name must be at most ${NAME_MAX_LENGTH} characters`,
                    });
                }
            }

            return { context: { body } };
        }),
    },
    plugins: [
        // Adds username to sign-up and profile updates, sign-in by username,
        // and checks that usernames are valid and unique
        username({
            minUsernameLength: USERNAME_MIN_LENGTH,
            maxUsernameLength: USERNAME_MAX_LENGTH,
            // Lowercase first, then allow only a-z, 0-9 and _. Sign-in by
            // username validates the raw input, so lowercase it here too.
            validationOrder: { username: "post-normalization" },
            usernameValidator: (value) =>
                USERNAME_PATTERN.test(value.toLowerCase()),
            displayUsername: false,
        }),
        // Must be last: lets server actions set auth cookies
        nextCookies(),
    ],
});

export type Session = typeof auth.$Infer.Session;
