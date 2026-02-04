import { Redis } from "@upstash/redis";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
export type CompanionKey = {
    companion: string,
    modelname: string,
    userId: string
}

export class MemoryManager {
    private static instance: MemoryManager;
    private history: Redis;
    private VectorDBClient: Pinecone;
    public constructor() {
        this.history = Redis.fromEnv();
        this.VectorDBClient = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });
    }

    public async init() {
        this.VectorDBClient = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });
    }

    public async vectorsearch(recentChatHistory: string, companionfileName: string) {
        const pineconeclient = <Pinecone>this.VectorDBClient;
        const pineconeIndex = pineconeclient.Index(process.env.PINECONE_INDEX! || "");
        const vectorStore = await PineconeStore.fromExistingIndex(
            new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
            { pineconeIndex }
        );
        const result = await vectorStore.similaritySearch(recentChatHistory, 3, { fileName: companionfileName }).catch(err => {
            console.log("failed to get result", err)
        })
        return result;
    }

    public static async getInstance(): Promise<MemoryManager> {
        if (!MemoryManager.instance) {
            MemoryManager.instance = new MemoryManager();
            await MemoryManager.instance.init();
        }
        return MemoryManager.instance;
    }
    private generaterediscompanionkey(companionKey: CompanionKey): string {
        return `${companionKey.companion}:${companionKey.modelname}:${companionKey.userId}`;
    }
    public async writeToHistory(text: string, companionKey: CompanionKey) {
        if (!companionKey || typeof companionKey.userId == "undefined") {
            console.log("Companion key incorrect")
            return "";
        }
        const key = this.generaterediscompanionkey(companionKey);
        const ans = await this.history.zadd(key, {
            score: Date.now(),
            member: text
        })
        return ans;
    }
    public async readhistory(companionKey: CompanionKey): Promise<string> {
        if (!companionKey || typeof companionKey.userId == "undefined") {
            console.log("Companion key incorrect")
            return "";
        }
        const key = this.generaterediscompanionkey(companionKey);
        let ans = await this.history.zrange(key, 0, Date.now(), {
            byScore: true
        });
        ans = ans.slice(-30).reverse();
        const recentchats = ans.reverse().join("\n");
        return recentchats;
    }
    public async seedChathistory(
        seedcontent: string,
        delimiter: string = "\n",
        companionKey: CompanionKey
    ) {
        const key = this.generaterediscompanionkey(companionKey);
        if (await this.history.exists(key)) {
            console.log("have history");
            return;
        }
        const content = seedcontent.split(delimiter);
        let count = 0;
        for (const line of content) {
            await this.history.zadd(key, { score: count, member: line });
            count++;
        }
    }
}