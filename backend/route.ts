import { LangChainStream } from './stream-utils';
import { ratelimit } from './rate-limit';
// import { auth, currentUser } from "@clerk/clerk-sdk-node"; // Not available in SDK-node
import { MemoryManager } from './memory';
import { CallbackManager } from "@langchain/core/callbacks/manager";
import { Replicate } from "@langchain/replicate";
import prismadb from './db';
import { Readable } from 'stream';

export async function POST(req: Request, { params }: { params: { chatId: string } }) {
    const { chatId } = params;
    try {
        const { prompt } = await req.json();
        // const user = await currentUser();
        const user: any = { id: "user_placeholder", firstName: "User" }; // Mock for compilation
        if (!user || !user.firstName || !user.id) {
            return Response.json({
                msg: "Unauthorized"
            }, { status: 401 });
        }

        const identifier = req.url + "-" + user.id;
        const { success } = await ratelimit(identifier);
        if (!success) {
            return Response.json({
                msg: "Rate limit exceeded"
            }, { status: 429 });
        }
        const companion = await prismadb.companion.findUnique({
            where: {
                id: chatId,
            },
            data: {
                messages: {
                    create: {
                        role: "user",
                        content: prompt,
                        userId: user.id

                    }
                }
            }
        })

        if (!companion) {
            return Response.json({
                msg: "Companion not found"
            }, { status: 404 });
        }
        const name = companion.name;
        const companion_file_name = companion.name + ".txt";
        const companionKey = {
            companion: companion.name,
            userId: user.id,
            modelname: "llma2-13b",
        };
        const memoryManager = await MemoryManager.getInstance();
        const records = await memoryManager.readhistory(companionKey);
        if (records.length === 0) {
            await memoryManager.seedChathistory(companion.seed, "\n\n", companionKey)
        }
        await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey)
        const recentChatHistory = await memoryManager.readhistory(companionKey);
        const similardocs = await memoryManager.vectorsearch(recentChatHistory, companion_file_name);

        let relevant = "";
        if (!!similardocs && similardocs.length > 0) {
            relevant = similardocs.map((doc: any) => doc.pageContent).join("\n");
        }
        const { handlers } = LangChainStream();
        const model = new Replicate({
            model: "a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
            apiKey: process.env.REPLICATE_API_KEY,
            input: {
                max_length: 2048
            },
            callbackManager: CallbackManager.fromHandlers(handlers),
        });
        model.verbose = true;
        const res = String(await model.call(`Only generate plain sentences without prefix of who is speaking , DO NOT USE ${name}:Prefix , ${companion.instructions}
            below are the relavent details of ${name}'s past and the conversation you are in,
            ${relevant}

            ${recentChatHistory}\n${name}
            `))

        const cleaned = res.replaceAll(",", "")
        const chunks = cleaned.split("\n");
        const response = chunks[0];
        await memoryManager.writeToHistory("" + response?.trim(), companionKey);

        let s = new Readable();
        s.push(response);
        s.push(null);
        if (response !== undefined && response.length > 1) {
            memoryManager.writeToHistory("" + response.trim(), companionKey);
            await prismadb.companion.update({
                where: {
                    id: params.chatId
                },
                data: {
                    messages: {
                        create: {
                            content: response.trim(),
                            role: "system",
                            userId: user.id
                        }
                    }
                }
            })
        }
        // Create a Web ReadableStream from Node Readable for Response compatibility
        const stream = new ReadableStream({
            start(controller) {
                s.on('data', chunk => controller.enqueue(chunk));
                s.on('end', () => controller.close());
                s.on('error', err => controller.error(err));
            }
        });

        return new Response(stream);
    } catch (err) {
        console.log(err, " error form chat api route")
        return Response.json({
            msg: "internal chat api error"
        }, { status: 500 });
    }
}

