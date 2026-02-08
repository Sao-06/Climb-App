/**
 * Mission Generator Service
 * 
 * Generates personalized missions based on user goals and preferences
 * using OpenAI API for intelligent mission creation.
 */

import { GoogleGenerativeAI } from '@google/genai';
import { Task, SubTask } from './types';

export interface MissionInput {
  userGoal: string;
  category?: 'health' | 'productivity' | 'learning' | 'fitness' | 'career' | 'personal';
  timeframe?: 'daily' | 'weekly' | 'monthly';
  difficulty?: 'easy' | 'medium' | 'hard';
  userProfile?: {
    name: string;
    level: number;
    pastGoals?: string[];
  };
}

export interface GeneratedMission {
  title: string;
  description: string;
  mainTask: Task;
  category: string;
  estimatedDays: number;
  motivation: string;
}

class MissionGeneratorService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Generate missions from user goals
   */
  async generateMissionsFromGoal(input: MissionInput): Promise<GeneratedMission[]> {
    try {
      const prompt = this.buildMissionPrompt(input);
      
      const response = await this.model.generateContent(prompt);
      const responseText = response.response.text();
      
      const missions = this.parseMissionResponse(responseText, input);
      return missions;
    } catch (error) {
      console.error('Error generating missions:', error);
      return this.getDefaultMissions(input);
    }
  }

  /**
   * Build structured prompt for mission generation
   */
  private buildMissionPrompt(input: MissionInput): string {
    return `You are a productivity coach for an app called "Climb" that helps users achieve their goals through gamified task management.

User Goal: ${input.userGoal}
Category: ${input.category || 'general'}
Timeframe: ${input.timeframe || 'flexible'}
Difficulty Preference: ${input.difficulty || 'medium'}
${input.userProfile ? `User Name: ${input.userProfile.name}, Level: ${input.userProfile.level}` : ''}

Generate 3 detailed missions that will help achieve this goal. For each mission, provide:
1. A clear, motivating mission title
2. A detailed description of what the mission entails
3. 4-6 specific subtasks with point values
4. Estimated number of days to complete
5. A motivational message

Format your response as JSON array with this structure:
[
  {
    "title": "Mission Title",
    "description": "What this mission achieves",
    "subtasks": [
      {"title": "Subtask 1", "points": 25, "difficulty": "easy"},
      {"title": "Subtask 2", "points": 50, "difficulty": "medium"}
    ],
    "estimatedDays": 7,
    "motivation": "Why this mission matters",
    "category": "${input.category || 'productivity'}"
  }
]

Focus on:
- Breaking down the goal into achievable subtasks
- Providing appropriate point values (easy: 25-40, medium: 50-75, hard: 100+)
- Making subtasks specific and actionable
- Including a motivational message that resonates`;
  }

  /**
   * Parse OpenAI response and convert to GeneratedMission objects
   */
  private parseMissionResponse(responseText: string, input: MissionInput): GeneratedMission[] {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\[\s*{[\s\S]*}\s*\]/);
      if (!jsonMatch) {
        console.warn('Could not parse mission response');
        return this.getDefaultMissions(input);
      }

      const missionData = JSON.parse(jsonMatch[0]);
      
      return missionData.map((mission: any, index: number) => ({
        title: mission.title || `Mission ${index + 1}`,
        description: mission.description || 'Work towards your goal',
        mainTask: {
          id: `mission_${Date.now()}_${index}`,
          title: mission.title,
          description: mission.description,
          subtasks: (mission.subtasks || []).map((subtask: any, idx: number) => ({
            id: `subtask_${Date.now()}_${index}_${idx}`,
            title: subtask.title,
            points: subtask.points || 50,
            completed: false,
            difficulty: subtask.difficulty || 'medium',
            estimatedMinutes: this.estimateMinutes(subtask.difficulty)
          })) as SubTask[],
          points: this.calculateTotalPoints(mission.subtasks || []),
          completed: false,
          difficulty: input.difficulty || 'medium',
          estimatedMinutes: (mission.estimatedDays || 7) * 60
        },
        category: mission.category || input.category || 'productivity',
        estimatedDays: mission.estimatedDays || 7,
        motivation: mission.motivation || 'You can achieve this goal!'
      }));
    } catch (error) {
      console.error('Error parsing mission response:', error);
      return this.getDefaultMissions(input);
    }
  }

  /**
   * Estimate minutes based on difficulty
   */
  private estimateMinutes(difficulty?: string): number {
    switch (difficulty) {
      case 'easy':
        return 15;
      case 'hard':
        return 60;
      default:
        return 30;
    }
  }

  /**
   * Calculate total points from subtasks
   */
  private calculateTotalPoints(subtasks: any[]): number {
    return subtasks.reduce((sum, task) => sum + (task.points || 50), 0);
  }

  /**
   * Fallback missions if API fails
   */
  private getDefaultMissions(input: MissionInput): GeneratedMission[] {
    const goalWords = input.userGoal.toLowerCase().split(' ').slice(0, 3).join(' ');
    
    return [
      {
        title: `Master ${goalWords}`,
        description: `Develop deep expertise and consistent habits around ${input.userGoal}`,
        mainTask: {
          id: `default_mission_1_${Date.now()}`,
          title: `Master ${goalWords}`,
          description: `A comprehensive mission to help you achieve your goal of ${input.userGoal}`,
          subtasks: [
            {
              id: 'sub_1',
              title: 'Define specific objectives',
              points: 25,
              completed: false,
              difficulty: 'easy',
              estimatedMinutes: 15
            },
            {
              id: 'sub_2',
              title: 'Research best practices',
              points: 50,
              completed: false,
              difficulty: 'medium',
              estimatedMinutes: 30
            },
            {
              id: 'sub_3',
              title: 'Create action plan',
              points: 75,
              completed: false,
              difficulty: 'medium',
              estimatedMinutes: 45
            },
            {
              id: 'sub_4',
              title: 'Execute first week',
              points: 100,
              completed: false,
              difficulty: 'hard',
              estimatedMinutes: 60
            }
          ],
          points: 250,
          completed: false,
          difficulty: input.difficulty || 'medium',
          estimatedMinutes: 150
        },
        category: input.category || 'productivity',
        estimatedDays: 7,
        motivation: `You're taking the first step towards ${input.userGoal}. Stay focused and celebrate small wins!`
      },
      {
        title: `Quick Win: ${goalWords}`,
        description: `Get quick momentum by completing achievable tasks related to ${input.userGoal}`,
        mainTask: {
          id: `default_mission_2_${Date.now()}`,
          title: `Quick Win: ${goalWords}`,
          description: `Complete a short mission to build momentum towards ${input.userGoal}`,
          subtasks: [
            {
              id: 'sub_1',
              title: 'Set a specific target',
              points: 30,
              completed: false,
              difficulty: 'easy',
              estimatedMinutes: 15
            },
            {
              id: 'sub_2',
              title: 'Complete first task',
              points: 60,
              completed: false,
              difficulty: 'medium',
              estimatedMinutes: 30
            },
            {
              id: 'sub_3',
              title: 'Celebrate and reflect',
              points: 40,
              completed: false,
              difficulty: 'easy',
              estimatedMinutes: 10
            }
          ],
          points: 130,
          completed: false,
          difficulty: 'easy',
          estimatedMinutes: 55
        },
        category: input.category || 'productivity',
        estimatedDays: 1,
        motivation: `Quick wins build momentum. Start today and feel the progress!`
      }
    ];
  }

  /**
   * Get mission recommendations based on user history
   */
  async getRecommendedMissions(
    userGoals: string[],
    userProfile?: any
  ): Promise<GeneratedMission[]> {
    if (userGoals.length === 0) {
      return [];
    }

    const allMissions: GeneratedMission[] = [];
    
    for (const goal of userGoals.slice(0, 3)) {
      const missions = await this.generateMissionsFromGoal({
        userGoal: goal,
        userProfile
      });
      allMissions.push(...missions);
    }

    // Return top 3 missions
    return allMissions.slice(0, 3);
  }
}

// Export singleton instance
export const missionGenerator = new MissionGeneratorService();
