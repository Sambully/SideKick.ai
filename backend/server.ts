import express, { Request, Response } from "express";
import "dotenv/config";
import crypto from "crypto";
import { LangChainStream } from "./stream-utils";
import { CallbackManager } from "@langchain/core/callbacks/manager";
import { Replicate } from "@langchain/community/llms/replicate"
import { ratelimit } from "./rate-limit";
import { MemoryManager } from "./memory";

import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});


import cors from "cors";
import prismadb from "./db";
import { ClerkExpressWithAuth, StrictAuthProp, clerkClient } from "@clerk/clerk-sdk-node";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { companionList } from "./subscriptions-part/subscription";
import { rmSync } from "fs";
const app = express();
const PORT = 3000;
app.use(cors());
declare global {
  namespace Express {
    interface Request extends StrictAuthProp { }
  }
}
//
app.use((req, res, next) => {
  console.log("--- INCOMING REQUEST ---");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Auth Header:", req.headers.authorization);
  next();
});
//
app.use(express.json());
const requiredAuth = ClerkExpressWithAuth({});

app.get("/", (req: Request, res: Response) => {
  res.json({ msg: "API is running!" });
});

app.get("/categories", async (req: Request, res: Response) => {
  try {
    const categories = await prismadb.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ msg: "Something went wrong" });
  }
});

app.get('/companions', requiredAuth, async (req: Request, res: Response) => {
  try {
    const { categoryId, name } = req.query;
    const userId = req.auth.userId;

    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const companions = await prismadb.companion.findMany({
      where: {
        userId: userId,
        ...(categoryId ? { categoryId: String(categoryId) } : {}),

        ...(name ? {
          name: {
            contains: String(name),
            mode: "insensitive"
          }
        } : {})
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        _count: {
          select: {
            messages: true
          }
        }
      }
    })
    res.json(companions)
  } catch (err) {
    console.log("Error fetching companoin : ", err),
      res.status(500).json({
        msg: "Something went wrong !!"
      })
  }
})

app.get('/companion/:id', async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id) {
    return res.json({
      mag: "Companion id is required"
    })
  }
  try {
    const companion = await prismadb.companion.findUnique({
      where: {
        id: id
      }
    })
    if (!companion) {
      return res.json({
        msg: "No companion found"
      })
    }
    res.json(companion)
  } catch (err) {
    console.log("Error in loading companion", err);
  }
})

app.patch(`/companion/:id`, requiredAuth, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const body = req.body;
  const userId = req.auth.userId;
  if (!userId) {
    return res.json({
      msg: "Unauthorized"
    })
  }
  if (!id) {
    return res.json({
      msg: "Companion id is required"
    })
  }
  const { src, name, description, instructions, seed, categoryId } = body;
  if (!src || !name || !description || !instructions || !seed || !categoryId) {
    return res.json({
      mag: "Details are missing"
    })
  }
  console.log("Updating companion:", id, "Body:", body);
  try {
    const companion = await prismadb.companion.update({
      where: {
        id: id,
        userId: userId
      },
      data: {
        src,
        name,
        description,
        instructions,
        seed,
        categoryId
      }
    });
    console.log("Companion updated:", companion);
    return res.json(companion);
  } catch (err) {
    console.log("Error in updating companion", err);
    return res.status(500).json({
      msg: "Something went wrong",
      error: String(err)
    })
  }
})

app.delete('/companion/:id', requiredAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const userId = req.auth.userId;
    if (!userId) {
      return res.json({
        msg: "User is unauthorized"
      })
    }
    if (!id) {
      return res.json({
        msg: "Companion id is required"
      })
    }
    const companion = await prismadb.companion.delete({
      where: {
        id: id,
        userId: userId
      }
    })
    return res.json(companion)

  } catch (err) {
    res.json({
      msg: "Something went wrong",
      err
    })
  }
})

app.post('/companion/new', requiredAuth, async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { src, name, description, instructions, seed, categoryId } = body;
    const userId = req.auth.userId;
    if (!userId) {
      return res.json({
        msg: "Unauthorized"
      })
    }
    const count = await prismadb.companion.count({
      where: { userId: userId }
    })
    const limit = await companionList(userId);
    if (count >= limit) {
      return res.json({
        msg: "Limit exceeded"
      })
    }
    if (!src || !name || !description || !instructions || !seed || !categoryId) {
      return res.json({
        msg: "Missing fields"
      })
    }
    const user = await clerkClient.users.getUser(userId);
    const username = user.username || " User";
    const companion = await prismadb.companion.create({
      data: {
        categoryId,
        src,
        username,
        name,
        description,
        instructions,
        seed,
        userId: userId
      }
    })
    return res.json(companion)

  } catch (err) {
    console.log("[COMPANION_POST_ERROR]", err);
    return res.status(500).json({
      mag: "Error while creating companion"
    })
  }
})

app.get('/chat/:chatId', requiredAuth, async (req: Request, res: Response) => {
  const { chatId } = req.params as { chatId: string };
  if (!chatId) {
    return res.json({
      msg: "Chat id is required"
    })
  }
  try {
    const chating = await prismadb.companion.findUnique({
      where: {
        id: chatId
      },
      include: {
        messages
          : {
          orderBy: {
            createdAt: "asc"
          },
          where: {
            userId: req.auth.userId
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    });
    if (!chating) {
      return res.json({
        msg: "No chat found"
      })
    }
    return res.json(chating)
  } catch (err) {
    console.log("[CHAT_GET_ERROR]", err);
    return res.status(500).json({
      msg: "Error while fetching chat"
    })
  }
})

app.post("/api/chat/:chatId", requiredAuth, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params as { chatId: string };
    const prompt = req.body.prompt;
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(404).json({
        msg: "Unauthorized user"
      })
    }

    const identifier = req.url + "-" + userId;
    const { success } = await ratelimit(identifier);
    if (!success) {
      return res.status(404).json({
        msg: "rate limit exceed"
      });
    }
    const companion = await prismadb.companion.findUnique({
      where: {
        id: chatId || ""
      },
      include: {
        messages: true
      }
    });
    if (!companion) {
      return res.status(404).json({
        msg: "No companion found"
      });
    }

    await prismadb.companion.update({
      where: { id: chatId || "" },
      data: {
        messages: {
          create: {
            content: prompt,
            userId: userId,
            role: "user"
          }
        }
      }
    });


    const name = companion.name;
    const companion_file_name = name + ".txt";
    const companionKey = {
      companion: name,
      userId: userId,
      modelname: "llama2-13b"
    }
    const memoryManager = await MemoryManager.getInstance();
    const records = await memoryManager.readhistory(companionKey);
    if (records.length === 0) {
      await memoryManager.seedChathistory(companion.seed, "\n\n", companionKey);
    }
    await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey);
    const recentChatHistory = await memoryManager.readhistory(companionKey);
    ////////////////////////////////////////
    // GEMINI WORK

    console.log("Preparing Gemini request...");
    const genAi = new GoogleGenerativeAI("AIzaSyB7TaufaR4ySmIWqfg9SgqpzJbYu9rb8Zs");
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
          where: { id: chatId || "" },
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



    ////////////////////////////////////////
    ////////////////////////////////////////
    // const similardocs = await memoryManager.vectorsearch(recentChatHistory, companion_file_name);
    // let releventhistory = "";
    // if (similardocs && similardocs.length > 0) {
    //   releventhistory = similardocs.map((doc: any) => doc.pageContent).join("\n")
    // }
    // const { handlers, stream } = LangChainStream();
    // const model = new Replicate({
    //   model: "meta/llama-2-13b-chat:f4e2de70d66816a838a89eeeb621910adffb0dd0baba3976c96980970978018d",
    //   apiKey: process.env.REPLICATE_API_KEY || "",
    //   input: { max_length: 2048 },
    //   callbacks: CallbackManager.fromHandlers(handlers)
    // });
    // console.log("Replicate: Invoking model...");
    // // @ts-ignore
    // model.invoke(`Only generate plain sentences without prefix of who is speaking. DO NOT USE ${name}: prefix. 
    //         ${companion.instructions}

    //         Below are relevant details of ${name}'s past and the conversation you are in:
    //         ${releventhistory}

    //         ${recentChatHistory}
    //         ${name}:`).then(() => console.log("Replicate: Invocation complete"))
    //   .catch((err) => console.error("Replicate: Error during invocation:", err));

    // res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    // res.setHeader('Transfer-Encoding', 'chunked');
    // const reader = stream.getReader();
    // let fullResponse = "";
    // try {
    //   while (true) {
    //     const { done, value } = await reader.read();
    //     if (done) break;
    //     const chunck = new TextDecoder().decode(value);
    //     console.log("Server: Chunk received from stream:", chunck);
    //     fullResponse += chunck;
    //     await res.write(chunck);
    //   }
    // } catch (streamError: any) {
    //   console.error("Server: Error reading stream:", streamError);
    //   // Attempt to send the error message to the client
    //   const errorMessage = `\n\n[Error: ${streamError.message || "Failed to generate response"}]`;
    //   await res.write(errorMessage);
    //   fullResponse += errorMessage;
    // }
    // console.log("Server: Response fully sent (Length: " + fullResponse.length + ")");


    // if (fullResponse.length > 0) {
    //   await memoryManager.writeToHistory(fullResponse.trim(), companionKey);
    //   await prismadb.companion.update({
    //     where: { id: chatId || "" },
    //     data: {
    //       messages: {
    //         create: {
    //           content: fullResponse.trim(),
    //           userId: userId,
    //           role: "system"
    //         }
    //       }
    //     }
    //   });
    // }
    // res.end();

  } catch (err) {
    console.log(err)
  }


})

app.post("/api/subscription/checkout", requiredAuth, async (req: Request, res: Response) => {
  const { planName, amount, newLimit } = req.body;
  const userId = req.auth.userId;
  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: `rcpt_${Date.now().toString().slice(-10)}_${userId.slice(-5)}`,
    notes: {
      planName,
      userId,
      newLimit: String(newLimit)
    }
  }

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.log("[SUBSCRIPTION_ERROR]", err);
    res.status(500).json({ msg: "Error creating order", error: String(err) });
  }

})


app.post("/api/subscription/verify", requiredAuth, async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName } = req.body;
  const userId = req.auth.userId;
  const razorpay_subscription_id = razorpay_payment_id;

  console.log("Verifying subscription for user:", userId);
  console.log("Payload:", { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName });

  if (!userId) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  const body = razorpay_order_id + "|" + razorpay_subscription_id;
  const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(body.toString()).digest("hex");

  console.log("Signatures:", { expected: expectedSignature, received: razorpay_signature });

  if (expectedSignature === razorpay_signature) {
    let verifiedLimit = 2;
    if (planName === "Pro") verifiedLimit = 4;
    if (planName === "Elite") verifiedLimit = 7;
    if (planName === "Alpha") verifiedLimit = 12;

    try {
      const sub = await prismadb.usersubscription.upsert({
        where: {
          userId: userId
        },
        create: {
          userId: userId,
          maxCompanions: verifiedLimit,
          razorpaySubscriptionId: razorpay_subscription_id,
          razorpayCustomerId: razorpay_payment_id, // Storing payment ID as customer ID for reference
          razorpayPlanId: planName,
          razorpayCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        update: {
          maxCompanions: verifiedLimit,
          razorpaySubscriptionId: razorpay_subscription_id,
          razorpayCustomerId: razorpay_payment_id,
          razorpayPlanId: planName,
          razorpayCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
      console.log("Subscription updated in DB:", sub);
      res.json({ success: true, verifiedLimit });
    } catch (error) {
      console.error("Subscription update error:", error);
      res.status(500).json({ msg: "Database update failed", error: String(error) });
    }
  } else {
    console.warn("Invalid signature");
    res.status(400).json({ msg: "Invalid signature" });
  }
})


app.get("/api/settings", requiredAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth.userId;
    if (!userId) return res.json({
      msg: "User is not authorized"
    })
    const subscription = await prismadb.usersubscription.findUnique({
      where: { userId: userId },
      select: {
        maxCompanions: true,
        razorpayCustomerId: true,
        razorpayCurrentPeriodEnd: true,
        razorpayPlanId: true
      }
    })
    const count = await prismadb.companion.count({
      where: { userId: userId }
    })
    console.log("Settings fetch:", { userId, subscription, count });

    const DAY_IN_MS = 86_400_000;
    const isPro = !!subscription?.razorpayCurrentPeriodEnd && (subscription.razorpayCurrentPeriodEnd.getTime() + DAY_IN_MS > Date.now());

    console.log("isPro check:", {
      currentPeriodEnd: subscription?.razorpayCurrentPeriodEnd,
      now: new Date(),
      isPro
    });

    return res.json({
      isPro,
      planName: isPro ? subscription?.razorpayPlanId : "Free",
      limit: isPro ? subscription?.maxCompanions : 2,
      count: count
    })
  } catch (err) {
    console.log(err);
    return res.json({
      msg: "Error in fetching  subscrition details in settings"
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 