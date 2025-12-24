import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
    try {
        await db.category.createMany({
            data: [
                { name: "Friend" },
                { name: "Philosopher" },
                { name: "Famous People" },
                { name: "Teacher" },
                { name: "Musicians" },
                { name: "Scientists" },
            ]
        });
        console.log("Success! Categories added.");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await db.$disconnect();
    }
}

main();
