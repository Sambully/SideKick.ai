import express, { Request, Response } from "express";
import cors from "cors";
import prismadb from "./db";

const app = express();
const PORT = 3000;
app.use(cors());

app.use(express.json());

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

app.get('/companion/:id', (req: Request, res: Response) => {

})

app.post('/companion/new', async (req: Request, res: Response) => {

})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});