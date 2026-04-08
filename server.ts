import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? (new GoogleGenAI({ apiKey }) as any) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes for Gemini
  app.get("/api/ai-status", (req, res) => {
    res.json({ connected: !!ai });
  });

  app.post("/api/generate-quiz", async (req, res) => {
    if (!ai) return res.status(500).json({ error: "AI not configured on server" });
    const { subject, age, level } = req.body;

    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Generate 3 educational quiz questions in Arabic for a child aged ${age} at level ${level}. 
      Subject: ${subject}. 
      Return the response as a JSON array of objects with question, options, correctAnswer, explanation.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      res.json(JSON.parse(response.text()));
    } catch (error: any) {
      console.error("Quiz Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/generate-story", async (req, res) => {
    if (!ai) return res.status(500).json({ error: "AI not configured on server" });
    const { topic, age } = req.body;

    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const isRobot = topic.toLowerCase().includes('روبوت') || topic.toLowerCase().includes('robot');
      const prompt = isRobot 
        ? `You are a master storyteller for children. Write a very short (max 80 words), exciting robot adventure in Arabic for a ${age} year old. 
           The hero is a friendly robot named 'Bebot'. 
           The story must be interactive and end with a simple choice (A or B). 
           NO humans, NO animals. Use only robots, gadgets, and stars. 
           Format: Clear, simple sentences.`
        : `Write a very short interactive story in Arabic for a child aged ${age}. Topic: ${topic}. End with a choice. Keep it under 120 words.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      res.json({ text: response.text() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/speak", async (req, res) => {
    if (!ai) return res.status(500).json({ error: "AI not configured on server" });
    const { text } = req.body;

    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`تحدث بصوت واضح: ${text}`);
      const response = await result.response;
      res.json({ text: response.text() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
