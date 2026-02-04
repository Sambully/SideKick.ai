// backend/check-models.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

async function check() {
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
        console.error("❌ ERROR: No GEMINI_API_KEY found in .env");
        return;
    }

    console.log("Using Key ending in:", key.slice(-5));

    try {
        // 1. Initialize
        const genAI = new GoogleGenerativeAI(key);

        // 2. We can't list models easily with the basic SDK method, 
        // so we will test the most common ones one by one.
        const modelsToTest = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.0-pro",
            "gemini-pro"
        ];

        console.log("\n--- TESTING MODELS ---");

        for (const modelName of modelsToTest) {
            try {
                process.stdout.write(`Testing '${modelName}'... `);
                const model = genAI.getGenerativeModel({ model: modelName });
                // Try to generate a tiny string
                await model.generateContent("Hi");
                console.log("✅ WORKS!");

                console.log(`\n🎉 SOLUTION FOUND: Change your server.ts to use "${modelName}"`);
                return; // Stop after finding one that works
            } catch (e: any) {
                if (e.message.includes("404")) {
                    console.log("❌ 404 Not Found");
                } else {
                    console.log("❌ Error:", e.message);
                }
            }
        }

        console.log("\n❌ CRITICAL: No models worked. This is likely an account or region issue.");

    } catch (error) {
        console.error("Fatal Error:", error);
    }
}

check();