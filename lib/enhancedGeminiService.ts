import { GoogleGenAI, Type } from "@google/genai";
import { SubTask, Task } from "./types";

// Initialize with API key from environment
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

/**
 * Enhanced task breakdown with context awareness
 * Analyzes task complexity and user skill level
 */
export const breakdownTaskWithContext = async (
  taskTitle: string,
  taskDescription?: string,
  userLevel?: number,
  previousTasks?: Task[]
): Promise<SubTask[]> => {
  if (!ai) {
    return generateFallbackSubtasks(taskTitle);
  }

  try {
    const contextPrompt = buildContextPrompt(
      taskTitle,
      taskDescription,
      userLevel,
      previousTasks
    );

    const response = await ai.models.generateContent({
      model: 'gemini-pro',
      contents: contextPrompt,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || '[]';
    const data = JSON.parse(text);
    
    return data.map((item: any, index: number) => ({
      id: `sub-${Date.now()}-${index}`,
      title: item.title,
      points: item.points,
      completed: false,
      estimatedMinutes: item.estimatedMinutes || 15,
      difficulty: item.difficulty || 'medium'
    }));
  } catch (error) {
    console.error("Error breaking down task:", error);
    return generateFallbackSubtasks(taskTitle);
  }
};

/**
 * Analyze user patterns and provide personalized advice
 */
export const analyzeUserPatterns = async (
  completedTasks: Task[],
  focusTime: number,
  distractionCount: number,
  timeOfDay: 'morning' | 'afternoon' | 'evening',
  streak: number
): Promise<{
  advice: string;
  motivationLevel: string;
  suggestedFocusTime: number;
  personalityInsight: string;
}> => {
  if (!ai) {
    return generateFallbackAnalysis();
  }

  try {
    const analysisPrompt = `
    Analyze this user's productivity patterns and provide personalized insights:
    
    - Completed Tasks: ${completedTasks.length}
    - Total Focus Time: ${focusTime} minutes
    - Distractions: ${distractionCount}
    - Time of Day: ${timeOfDay}
    - Current Streak: ${streak} days
    - Average Task Points: ${completedTasks.length > 0 ? (completedTasks.reduce((sum, t) => sum + t.points, 0) / completedTasks.length).toFixed(0) : 0}
    
    Provide JSON response with:
    {
      "advice": "personalized motivation (max 50 words)",
      "motivationLevel": "high|medium|low",
      "suggestedFocusTime": "number in minutes",
      "personalityInsight": "what their patterns reveal (max 30 words)"
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-pro',
      contents: analysisPrompt,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || '{}';
    const data = JSON.parse(text);
    
    return {
      advice: data.advice || 'Keep pushing forward!',
      motivationLevel: data.motivationLevel || 'medium',
      suggestedFocusTime: data.suggestedFocusTime || 25,
      personalityInsight: data.personalityInsight || 'Consistent and dedicated'
    };
  } catch (error) {
    console.error("Error analyzing patterns:", error);
    return generateFallbackAnalysis();
  }
};

/**
 * Generate smart task suggestions based on user history
 */
export const suggestNextTasks = async (
  completedTasks: Task[],
  userLevel: number,
  interests?: string[]
): Promise<Array<{ title: string; description: string; estimatedPoints: number }>> => {
  if (!ai) {
    return generateFallbackSuggestions();
  }

  try {
    const suggestPrompt = `
    Based on the user's productivity patterns and interests, suggest 3 realistic next tasks:
    
    Completed ${completedTasks.length} tasks:
    ${completedTasks.slice(-5).map(t => `- ${t.title} (${t.points} points)`).join('\n')}
    
    User Level: ${userLevel}
    Interests: ${interests?.join(', ') || 'general productivity'}
    
    Return JSON array with:
    [
      {
        "title": "task name",
        "description": "brief description",
        "estimatedPoints": "number (10-100)"
      }
    ]
    
    Make suggestions progressively harder if user is advanced, or easier if beginner.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-pro',
      contents: suggestPrompt,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || '[]';
    return JSON.parse(text);
  } catch (error) {
    console.error("Error suggesting tasks:", error);
    return generateFallbackSuggestions();
  }
};

/**
 * Generate achievement-based motivation
 */
export const generateAchievementMessage = async (
  achievementName: string,
  milestonePoints: number,
  level: number
): Promise<string> => {
  if (!ai) {
    return `🎉 Achievement Unlocked: ${achievementName}!`;
  }

  try {
    const prompt = `
    Generate an exciting, brief celebration message (max 15 words) for this achievement:
    - Achievement: ${achievementName}
    - Milestone Points: ${milestonePoints}
    - User Level: ${level}
    
    Make it motivational and climbing-themed!
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-pro',
      contents: prompt
    });

    return response.text || `🎉 Achievement Unlocked: ${achievementName}!`;
  } catch (error) {
    console.error("Error generating achievement message:", error);
    return `🎉 Achievement Unlocked: ${achievementName}!`;
  }
};

// ============= HELPER FUNCTIONS =============

function buildContextPrompt(
  taskTitle: string,
  taskDescription?: string,
  userLevel?: number,
  previousTasks?: Task[]
): string {
  const difficulty = estimateDifficulty(userLevel, previousTasks);
  const subtaskCount = Math.min(Math.max(3 + (userLevel || 0) / 10, 3), 7);

  return `
  Break down this productivity task into ${Math.round(subtaskCount)} actionable sub-steps.
  
  Task: "${taskTitle}"
  ${taskDescription ? `Description: ${taskDescription}` : ''}
  User Level: ${userLevel || 1}
  Suggested Difficulty: ${difficulty}
  
  For each subtask, provide:
  - A clear, actionable title
  - Point value (10-50, higher for harder tasks)
  - Estimated time in minutes
  - Difficulty level (easy, medium, hard)
  
  Return valid JSON array:
  [
    {
      "title": "subtask description",
      "points": 20,
      "estimatedMinutes": 10,
      "difficulty": "easy"
    }
  ]
  
  Make subtasks specific and measurable.
  `;
}

function estimateDifficulty(
  userLevel?: number,
  previousTasks?: Task[]
): 'beginner' | 'intermediate' | 'advanced' {
  const level = userLevel || 1;
  
  if (level <= 5) return 'beginner';
  if (level <= 20) return 'intermediate';
  return 'advanced';
}

function generateFallbackSubtasks(taskTitle: string): SubTask[] {
  return [
    {
      id: `sub-${Date.now()}-0`,
      title: `Plan: ${taskTitle}`,
      points: 15,
      completed: false,
      estimatedMinutes: 10,
      difficulty: 'easy'
    },
    {
      id: `sub-${Date.now()}-1`,
      title: `Execute: ${taskTitle}`,
      points: 30,
      completed: false,
      estimatedMinutes: 20,
      difficulty: 'medium'
    },
    {
      id: `sub-${Date.now()}-2`,
      title: `Review: ${taskTitle}`,
      points: 20,
      completed: false,
      estimatedMinutes: 10,
      difficulty: 'easy'
    }
  ];
}

function generateFallbackAnalysis() {
  return {
    advice: 'You\'re making great progress! Keep building momentum.',
    motivationLevel: 'medium' as const,
    suggestedFocusTime: 25,
    personalityInsight: 'Consistent and dedicated worker'
  };
}

function generateFallbackSuggestions() {
  return [
    {
      title: 'Learn something new',
      description: 'Pick a skill you want to develop',
      estimatedPoints: 30
    },
    {
      title: 'Complete a project',
      description: 'Finish one of your ongoing projects',
      estimatedPoints: 50
    },
    {
      title: 'Help someone',
      description: 'Assist a colleague or friend',
      estimatedPoints: 25
    }
  ];
}
