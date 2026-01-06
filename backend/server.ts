import express, { Request, Response } from "express";
import cors from "cors";
import prismadb from "./db";
import { ClerkExpressRequireAuth, StrictAuthProp, clerkClient } from "@clerk/clerk-sdk-node";
import "dotenv/config"
const app = express();
const PORT = 3000;
app.use(cors());
declare global {
  namespace Express {
    interface Request extends StrictAuthProp { }
  }
}
app.use(express.json());
const requiredAuth = ClerkExpressRequireAuth({});

app.get("/", (req: Request, res: Response) => {
  res.json({ msg: "API is running!" });
});

app.get("/categories", async (req: Request, res: Response) => {
  try {
    const categories = await prismadb.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.json({ msg: "Something went wrong" });
  }
});

app.get('/companions', async (req: Request, res: Response) => {
  try {
    const { categoryId, name } = req.query;
    const companions = await prismadb.companion.findMany({
      where: {
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
      res.json({
        msg: "Something went wrong !!"
      })
  }
})

app.get('/companion/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
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
  const { id } = req.params;
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
  const { src, name, description, instructions, seed, categoryId, username } = body;
  if (!src || !name || !description || !instructions || !seed || !categoryId || !username) {
    return res.json({
      mag: "Details are missing"
    })
  }
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
        categoryId,
        username
      }
    })
  } catch (err) {
    console.log("Error in updating companion", err);
    return res.json({
      msg: "Something went wrong"
    })
  }
})

app.delete('/companion/:id', requiredAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
  const { chatId } = req.params;
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});