import { GoogleGenAI, Type } from "@google/genai";
import { SubTask } from "./types";

// Initialize with API key from environment
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const breakdownTask = async (taskTitle: string): Promise<SubTask[]> => {
  if (!ai) {
    console.warn("Gemini API not configured");
    return [
      {
        id: `sub-${Date.now()}-0`,
        title: `Step 1: ${taskTitle}`,
        points: 25,
        completed: false
      },
      {
        id: `sub-${Date.now()}-1`,
        title: `Step 2: ${taskTitle}`,
        points: 25,
        completed: false
      }
    ];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Break down the following productivity task into 3-5 actionable sub-steps. Assign a point value (10-50) to each based on difficulty. Task: "${taskTitle}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              points: { type: Type.NUMBER }
            },
            required: ["title", "points"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    return data.map((item: any, index: number) => ({
      id: `sub-${Date.now()}-${index}`,
      title: item.title,
      points: item.points,
      completed: false
    }));
  } catch (error) {
    console.error("Error breaking down task:", error);
    // Fallback subtasks
    return [
      {
        id: `sub-${Date.now()}-0`,
        title: `Complete ${taskTitle}`,
        points: 50,
        completed: false
      }
    ];
  }
};

export const getCoachAdvice = async (points: number, height: number): Promise<string> => {
  if (!ai) {
    const tips = [
      "Keep climbing, the view is better at the top!",
      "Every step forward is progress!",
      "Your expedition awaits!",
      "Focus on the summit, not the slope!"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a motivational Mountain Climbing Coach. A user has ${points} focus points and has climbed ${height} meters today. Give a short, punchy, climbing-themed motivational quote or advice (max 20 words).`,
    });
    return response.text || "Keep climbing, the view is better at the top!";
  } catch (error) {
    console.error("Error getting coach advice:", error);
    return "Keep climbing, the view is better at the top!";
  }
};
