import { STATIC_QUIZZES, STATIC_STORIES } from "../constants/staticContent";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export async function isAIConnected(): Promise<boolean> {
  try {
    const res = await fetch("/api/ai-status");
    const data = await res.json();
    return data.connected;
  } catch {
    return false;
  }
}

export async function speakText(text: string): Promise<string | null> {
  try {
    const res = await fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (data.audio) {
      return `data:audio/wav;base64,${data.audio}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
}

export async function generateAdaptiveQuiz(subject: string, age: number, level: number): Promise<QuizQuestion[]> {
  let fallbackKey = 'math';
  if (subject.includes('علوم')) fallbackKey = 'science';
  if (subject.includes('لغة')) fallbackKey = 'language';
  if (subject.includes('منطق')) fallbackKey = 'logic';

  try {
    const res = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, age, level })
    });
    if (!res.ok) throw new Error("API Error");
    return await res.json();
  } catch (error) {
    console.error("Error generating quiz, using fallback:", error);
    return STATIC_QUIZZES[fallbackKey] || STATIC_QUIZZES['math'];
  }
}

export async function generateInteractiveStory(topic: string, age: number): Promise<string> {
  let fallbackKey = 'space';
  if (topic.includes('أشكال')) fallbackKey = 'shapes';
  if (topic.includes('روبوت')) fallbackKey = 'robots';

  try {
    const res = await fetch("/api/generate-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, age })
    });
    if (!res.ok) throw new Error("API Error");
    const data = await res.json();
    return data.text || STATIC_STORIES[fallbackKey];
  } catch (error) {
    console.error("Error generating story, using fallback:", error);
    return STATIC_STORIES[fallbackKey] || STATIC_STORIES['space'];
  }
}
