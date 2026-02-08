/**
 * Integration Example: Complete AI-Powered Task Breakdown & Coaching System
 * 
 * This file demonstrates how to integrate all the AI, coaching, and persistence
 * services together to create a seamless productivity experience.
 */

import { breakdownTaskWithContext, analyzeUserPatterns, suggestNextTasks } from './enhancedGeminiService';
import { coachingSystem, CoachingProfile } from './coachSystem';
import {
  initializeStorage,
  saveTask,
  getTasks,
  completeTask,
  getUserProfile,
  saveUserProfile,
  updateUserMetrics,
  saveCoachingAdvice,
  getCompletedTasks
} from './persistenceService';
import {
  trackTaskCreation,
  trackTaskCompletion,
  trackCoachMessage,
  calculateAIPerformanceMetrics,
  getAnalyticsSummary
} from './analyticsService';
import { missionGenerator, MissionInput, GeneratedMission } from './missionGenerator';
import { Task, SubTask, UserProfile } from './types';

/**
 * Main application state manager
 */
export class ClimbAppManager {
  private initialized = false;

  /**
   * Initialize the entire system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize storage and load user data
      await initializeStorage();
      
      // Get user profile
      const profile = await getUserProfile();
      if (profile) {
        // Initialize coaching system with user metrics
        const metrics = {
          level: profile.level,
          totalXP: profile.points,
          streak: 0, // Would be loaded from persistent storage
          lastSessionDate: new Date(),
          tasksCompletedToday: 0,
          focusTimeToday: 0,
          distractionsToday: 0,
          averageTaskPoints: 0
        };

        await coachingSystem.initialize(`user-${profile.name}`, metrics);
      }

      this.initialized = true;
      console.log('🧗 Climb App Manager initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
      throw error;
    }
  }

  /**
   * Create a new task with AI-powered breakdown
   * 
   * Example:
   * ```
   * const task = await manager.createTaskWithAIBreakdown(
   *   'Learn TypeScript',
   *   'Master TypeScript fundamentals including types, interfaces, and generics'
   * );
   * ```
   */
  async createTaskWithAIBreakdown(
    title: string,
    description?: string
  ): Promise<Task> {
    try {
      // Get current user profile for context
      const profile = await getUserProfile();
      const completedTasks = await getCompletedTasks();

      // Get AI-powered subtasks
      const subtasks = await breakdownTaskWithContext(
        title,
        description,
        profile?.level || 1,
        completedTasks.slice(-10) // Pass last 10 completed tasks for context
      );

      // Create task object
      const task: Task = {
        id: `task-${Date.now()}`,
        title,
        description,
        subtasks,
        points: subtasks.reduce((sum, s) => sum + s.points, 0),
        completed: false,
        createdAt: new Date(),
        difficulty: this.calculateTaskDifficulty(subtasks)
      };

      // Save to persistent storage
      await saveTask(task);

      // Track analytics
      const startTime = Date.now();
      await trackTaskCreation(
        title,
        subtasks.length,
        Date.now() - startTime
      );

      // Get coaching encouragement
      const coach = await coachingSystem.getGeneralAdvice({
        level: profile?.level || 1,
        totalXP: profile?.points || 0,
        streak: 0,
        lastSessionDate: new Date(),
        tasksCompletedToday: 0,
        focusTimeToday: 0,
        distractionsToday: 0,
        averageTaskPoints: 0
      });

      await saveCoachingAdvice({
        message: coach.message,
        context: coach.context,
        timestamp: coach.timestamp
      });

      return task;
    } catch (error) {
      console.error('Error creating task with AI breakdown:', error);
      throw error;
    }
  }

  /**
   * Complete a task and update all systems
   * 
   * Example:
   * ```
   * await manager.completeTaskWithRewards(
   *   'task-123',
   *   45, // time spent in minutes
   *   ['Learn types', 'Learn interfaces'] // which subtasks completed
   * );
   * ```
   */
  async completeTaskWithRewards(
    taskId: string,
    timeSpentMinutes: number,
    completedSubtaskTitles?: string[]
  ): Promise<void> {
    try {
      const tasks = await getTasks();
      const task = tasks.find(t => t.id === taskId);

      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }

      // Update task completion
      await completeTask(taskId);

      // Update user metrics
      await updateUserMetrics({
        pointsEarned: task.points,
        focusTimeAdded: timeSpentMinutes
      });

      // Track completion
      await trackTaskCompletion(
        taskId,
        task.points,
        timeSpentMinutes,
        task.difficulty || 'medium'
      );

      // Get profile and show achievement message
      const profile = await getUserProfile();
      if (profile) {
        // Check if level up
        if (Math.floor(profile.points / 500) > profile.level - 1) {
          const achievement = `Reached Level ${profile.level}!`;
          const message = await coachingSystem.getStreakMilestoneAdvice(
            1,
            profile.points,
            profile.level
          );

          await saveCoachingAdvice({
            message,
            context: 'achievement',
            timestamp: new Date()
          });
        }

        // Get evening review or next task suggestion
        const completedTasks = await getCompletedTasks();
        const nextAdvice = await coachingSystem.getNextTaskRecommendation(
          {
            level: profile.level,
            totalXP: profile.points,
            streak: 0,
            lastSessionDate: new Date(),
            tasksCompletedToday: 1, // Would be tracked properly
            focusTimeToday: timeSpentMinutes,
            distractionsToday: 0,
            averageTaskPoints: profile.points / completedTasks.length
          },
          completedTasks.slice(-5)
        );

        await saveCoachingAdvice({
          message: nextAdvice,
          context: 'general',
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  /**
   * Get personalized task suggestions based on history
   * 
   * Example:
   * ```
   * const suggestions = await manager.getPersonalizedSuggestions();
   * ```
   */
  async getPersonalizedSuggestions(): Promise<
    Array<{ title: string; description: string; estimatedPoints: number }>
  > {
    try {
      const profile = await getUserProfile();
      const completedTasks = await getCompletedTasks();

      if (!profile) {
        throw new Error('User profile not found');
      }

      return await suggestNextTasks(
        completedTasks,
        profile.level,
        ['productivity', 'learning', 'fitness'] // default interests
      );
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  /**
   * Get daily coaching and analytics
   * 
   * Example:
   * ```
   * const dailyReport = await manager.getDailyReport();
   * console.log(dailyReport.coaching);
   * console.log(dailyReport.analytics);
   * ```
   */
  async getDailyReport(): Promise<{
    coaching: string;
    analytics: any;
    aiMetrics: any;
  }> {
    try {
      const profile = await getUserProfile();
      const completedTasks = await getCompletedTasks();

      if (!profile) {
        throw new Error('User profile not found');
      }

      const userMetrics = {
        level: profile.level,
        totalXP: profile.points,
        streak: 0,
        lastSessionDate: new Date(),
        tasksCompletedToday: 1,
        focusTimeToday: profile.totalFocusTime,
        distractionsToday: 0,
        averageTaskPoints: profile.points / completedTasks.length
      };

      // Get coaching analysis
      const coaching = await coachingSystem.getDailyAnalysis(
        userMetrics,
        completedTasks
      );

      // Get analytics
      const analytics = await getAnalyticsSummary(24);
      const aiMetrics = await calculateAIPerformanceMetrics();

      return {
        coaching,
        analytics,
        aiMetrics
      };
    } catch (error) {
      console.error('Error getting daily report:', error);
      return {
        coaching: 'Keep climbing!',
        analytics: {},
        aiMetrics: {}
      };
    }
  }

  /**
   * Get AI system performance metrics
   */
  async getAIMetrics(): Promise<any> {
    try {
      const metrics = await calculateAIPerformanceMetrics();
      return {
        taskBreakdownAccuracy: `${(metrics.taskBreakdownAccuracy * 100).toFixed(1)}%`,
        coachAdviceRelevance: `${(metrics.coachAdviceRelevance * 100).toFixed(1)}%`,
        taskCompletionRate: `${(metrics.taskCompletionRate * 100).toFixed(1)}%`,
        averageTimeToComplete: `${metrics.averageTimeToComplete.toFixed(0)} min`,
        userSatisfaction: `${(metrics.userSatisfaction * 100).toFixed(1)}%`
      };
    } catch (error) {
      console.error('Error getting AI metrics:', error);
      return {};
    }
  }

  /**
   * Generate missions from user goals using AI
   * 
   * Example:
   * ```
   * const missions = await manager.generateMissionsFromGoal({
   *   userGoal: 'Learn React Native',
   *   category: 'learning',
   *   difficulty: 'medium'
   * });
   * ```
   */
  async generateMissionsFromGoal(input: MissionInput): Promise<GeneratedMission[]> {
    try {
      const profile = await getUserProfile();
      const missions = await missionGenerator.generateMissionsFromGoal({
        ...input,
        userProfile: profile || undefined
      });

      // Track mission generation
      if (missions.length > 0) {
        await trackTaskCreation(`Mission: ${input.userGoal}`, missions.length, Date.now());
      }

      return missions;
    } catch (error) {
      console.error('Error generating missions:', error);
      return [];
    }
  }

  /**
   * Get recommended missions based on user profile
   * 
   * Example:
   * ```
   * const recommendations = await manager.getRecommendedMissions(['goal1', 'goal2']);
   * ```
   */
  async getRecommendedMissions(userGoals: string[]): Promise<GeneratedMission[]> {
    try {
      const profile = await getUserProfile();
      return await missionGenerator.getRecommendedMissions(userGoals, profile);
    } catch (error) {
      console.error('Error getting recommended missions:', error);
      return [];
    }
  }

  // ========== PRIVATE HELPERS ==========

  private calculateTaskDifficulty(subtasks: SubTask[]): 'easy' | 'medium' | 'hard' {
    const avgPoints = subtasks.reduce((sum, s) => sum + s.points, 0) / subtasks.length;
    
    if (avgPoints <= 15) return 'easy';
    if (avgPoints <= 30) return 'medium';
    return 'hard';
  }
}

/**
 * Export singleton instance
 */
export const appManager = new ClimbAppManager();
