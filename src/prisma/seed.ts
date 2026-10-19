import { db } from "./db";

async function main() {
    const created = await db.orm.public.User.create({
        email: "alice@example.com",
        name: "Alice",
    });
    console.log("Created:", created);

    const users = await db.orm.public.User.all();
    console.log("All users:", users);

    await db.close();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
