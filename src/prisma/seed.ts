import "dotenv/config";
import { prisma } from "./db";

async function main() {
    // upsert keeps the seed re-runnable (email is unique)
    const alice = await prisma.user.upsert({
        where: { email: "alice@example.com" },
        update: {},
        create: {
            email: "alice@example.com",
            name: "Alice",
        },
    });
    console.log("Seeded:", alice);

    const users = await prisma.user.findMany();
    console.log("All users:", users);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });
