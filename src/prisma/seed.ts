import "dotenv/config";
import { prisma } from "./db";

async function main() {
    // Seed data goes here once the new models exist
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
