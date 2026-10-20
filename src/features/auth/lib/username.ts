import "server-only";

import {
    USERNAME_MAX_LENGTH,
    USERNAME_MIN_LENGTH,
} from "@/features/auth/utils/auth-rules";
import { prisma } from "@/prisma/db";

// Builds a free, valid username for users who sign up with Google, which
// doesn't provide one: "Thomas.Weber@gmail.com" becomes "thomas_weber",
// or "thomas_weber_4821" if that's taken
export async function generateUsername(email: string) {
    const cleaned = (email.split("@")[0] ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, "_")
        .replace(/^_+|_+$/g, "")
        // Leave room for a "_1234" suffix
        .slice(0, USERNAME_MAX_LENGTH - 5);
    const base = cleaned ? cleaned.padEnd(USERNAME_MIN_LENGTH, "0") : "player";

    let candidate = base;
    for (let attempt = 0; attempt < 10; attempt++) {
        const taken = await prisma.user.findUnique({
            where: { username: candidate },
            select: { id: true },
        });
        if (!taken) {
            return candidate;
        }
        candidate = `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
    }
    throw new Error("Could not find a free username");
}
