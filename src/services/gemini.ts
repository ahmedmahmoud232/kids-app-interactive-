import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export async function generateAdaptiveQuiz(subject: string, age: number, level: number): Promise<QuizQuestion[]> {
  const prompt = `Generate 3 educational quiz questions in Arabic for a child aged ${age} at level ${level}. 
  Subject: ${subject}. 
  The questions should be fun, engaging, and suitable for the age.
  Avoid any mention of living organisms or humans in the questions or options. Use inanimate objects, shapes, planets, or abstract concepts.
  Return the response as a JSON array of objects with the following structure:
  {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctAnswer": "string",
    "explanation": "string"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
}

export async function generateInteractiveStory(topic: string, age: number): Promise<string> {
  const prompt = `Write a very short interactive story in Arabic for a child aged ${age}.
  Topic: ${topic}.
  Constraint: DO NOT use any humans, animals, or living organisms in the story. Use robots, stars, planets, or talking shapes.
  The story should end with a choice for the child to make.
  Keep it simple and engaging.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    return response.text || "حدث خطأ أثناء إنشاء القصة.";
  } catch (error) {
    console.error("Error generating story:", error);
    return "عذراً، لا يمكننا سرد قصة الآن.";
  }
}
