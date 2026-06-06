import express from "express";
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env") });

import { mastra } from "./src/mastra/index.ts";

const app = express();
app.use(express.json());

app.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "question is required" });
  }

  try {
    const agent = mastra.getAgent("tara");
    const result = await agent.generate(question);
    return res.json({ answer: result.text });
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Tara server running on http://localhost:${PORT}`);
});