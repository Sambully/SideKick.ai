import { Request, Response } from "express";
import { ratelimit } from './rate-limit';
import { MemoryManager } from './memory';
import prismadb from './db';
import { companionList } from './subscriptions-part/subscription';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { StrictAuthProp } from "@clerk/clerk-sdk-node";

type AuthenticatedRequest = Request & StrictAuthProp;

export const POST = async (req: AuthenticatedRequest, res: Response) => {
    const { chatId: rawChatId } = req.params;
    const chatId = Array.isArray(rawChatId) ? rawChatId[0] : rawChatId;

    if (!chatId || typeof chatId !== "string") {
        return res.status(400).json({ msg: "Invalid chatId" });
    }

    try {
        const { prompt } = req.body;
        const userId = req.auth.userId;

        if (!userId) {
            return res.status(401).json({ msg: "Unauthorized" });
        }

        const count = await prismadb.companion.count({
            where: { userId: userId }
        })
        const limit = await companionList(userId);
        if (count >= limit) {
            return res.status(400).json({
                msg: "Limit exceeded"
            })
        }

        const identifier = req.url + "-" + userId;
        const { success } = await ratelimit(identifier);
        if (!success) {
            return res.status(429).json({
                msg: "Rate limit exceeded"
            });
        }
        const companion = await prismadb.companion.findUnique({
            where: {
                id: chatId,
            },
            include: {
                messages: true
            }
        })

        if (!companion) {
            return res.status(404).json({
                msg: "Companion not found"
            });
        }
        await prismadb.companion.update({
            where: {
                id: chatId
            },
            data: {
                messages: {
                    create: {
                        role: "user",
                        content: prompt,
                        userId: userId
                    }
                }
            }
        });

        const name = companion.name;
        const companion_file_name = companion.name + ".txt";
        const companionKey = {
            companion: companion.name,
            userId: userId,
            modelname: "llama2-13b",
        };
        const memoryManager = await MemoryManager.getInstance();
        const records = await memoryManager.readhistory(companionKey);
        if (records.length === 0) {
            await memoryManager.seedChathistory(companion.seed, "\n\n", companionKey)
        }
        await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey)
        const recentChatHistory = await memoryManager.readhistory(companionKey);

        const genAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "AIzaSyB7TaufaR4ySmIWqfg9SgqpzJbYu9rb8Zs");
        const model = genAi.getGenerativeModel({ model: "gemini-2.5-flash" });

        const final_prompt = `
          You are ${name}, created by ${companion.username}.
          
          YOUR INSTRUCTIONS:
          ${companion.instructions}
    
          CONTEXT FROM MEMORY:
          ${recentChatHistory}
    
          User: ${prompt}
          ${name}:
        `;

        console.log("Sending prompt to Gemini...", final_prompt.substring(0, 50) + "...");

        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        if (typeof (res as any).flushHeaders === 'function') {
            (res as any).flushHeaders();
        }

        try {
            const result = await model.generateContentStream(final_prompt);
            console.log("Stream started");

            let fullResponse = "";

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                if (!chunkText) continue;

                fullResponse += chunkText;
                res.write(chunkText);

                if (typeof (res as any).flush === 'function') {
                    (res as any).flush();
                }

                await new Promise(resolve => setTimeout(resolve, 10));
            }

            console.log("Stream finished. Full response length:", fullResponse.length);

            if (fullResponse.length > 0) {
                const cleanResponse = fullResponse.trim();
                await memoryManager.writeToHistory(cleanResponse, companionKey);
                await prismadb.companion.update({
                    where: { id: chatId },
                    data: {
                        messages: {
                            create: {
                                content: cleanResponse,
                                userId: userId,
                                role: "system"
                            }
                        }
                    }
                });
            }
        } catch (apiError: any) {
            console.error("Gemini API Error:", apiError);
            if (!res.headersSent) {
                res.status(500).json({ msg: "AI generation failed" });
            } else {
                res.write(`\n[Error: ${apiError.message}]`);
            }
        } finally {
            res.end();
        }

    } catch (err) {
        console.log(err, " error form chat api route")
        if (!res.headersSent) {
            return res.status(500).json({
                msg: "internal chat api error"
            });
        }
    }
}
