import "server-only";

import { prisma } from "@/prisma/db";

// What the edit profile page needs beyond the session's user data
export async function getAccountProfile(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: { bio: true, gender: true },
    });
}
