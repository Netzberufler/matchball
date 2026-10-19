import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

function createPrismaClient() {
    const adapter = new PrismaPg({
        connectionString: process.env["DATABASE_URL"]!,
    });
    return new PrismaClient({ adapter });
}

// Reuse one client across Next.js hot reloads in development
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
