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
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes for Gemini
  app.get("/api/ai-status", (req, res) => {
    res.json({ connected: !!ai });
  });

  app.post("/api/generate-quiz", async (req, res) => {
    if (!ai) return res.status(500).json({ error: "AI not configured" });
    const { subject, age, level } = req.body;

    const prompt = `Generate 3 educational quiz questions in Arabic for a child aged ${age} at level ${level}. 
    Subject: ${subject}. 
    Return the response as a JSON array of objects with question, options, correctAnswer, explanation.`;

    try {
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      res.json(JSON.parse(result.text));
    } catch (error: any) {
      console.error("Quiz Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/generate-story", async (req, res) => {
    if (!ai) return res.status(500).json({ error: "AI not configured" });
    const { topic, age } = req.body;

    const prompt = `Write a very short interactive story in Arabic for a child aged ${age}. Topic: ${topic}. End with a choice.`;

    try {
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      res.json({ text: result.text });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/speak", async (req, res) => {
    if (!ai) return res.status(500).json({ error: "AI not configured" });
    const { text } = req.body;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `تحدث بصوت واضح: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      res.json({ audio: base64Audio });
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
