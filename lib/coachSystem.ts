import { breakdownTaskWithContext, analyzeUserPatterns, generateAchievementMessage } from './enhancedGeminiService';
import { Task, UserProfile, SubTask } from './types';

export interface CoachAdvice {
  id: string;
  message: string;
  timestamp: Date;
  context: 'morning-start' | 'midday-boost' | 'evening-review' | 'streak-milestone' | 'achievement' | 'general';
  intensity: 'gentle' | 'moderate' | 'intense';
}

export interface UserMetrics {
  level: number;
  totalXP: number;
  streak: number;
  lastSessionDate: Date;
  tasksCompletedToday: number;
  focusTimeToday: number;
  distractionsToday: number;
  averageTaskPoints: number;
}

export interface CoachingProfile {
  userId: string;
  personalityType: 'steady' | 'ambitious' | 'explorer' | 'collaborative';
  preferredMotivationStyle: 'logical' | 'emotional' | 'competitive' | 'supportive';
  peakProductivityHour: number;
  bestDay: string;
  streakRecord: number;
}

/**
 * Main coaching system that adapts to user behavior
 */
export class CoachingSystem {
  private conversationHistory: CoachAdvice[] = [];
  private userProfile: CoachingProfile | null = null;

  /**
   * Initialize coaching system with user data
   */
  async initialize(userId: string, userMetrics: UserMetrics): Promise<void> {
    this.userProfile = this.determinePsychographics(userMetrics);
  }

  /**
   * Get morning motivation - sets tone for the day
   */
  async getMorningMotivation(userMetrics: UserMetrics): Promise<CoachAdvice> {
    const timeOfDay = this.getTimeOfDay();
    
    if (timeOfDay !== 'morning') {
      return this.getGeneralAdvice(userMetrics);
    }

    const message = this.generateMorningMessage(userMetrics);
    
    const advice: CoachAdvice = {
      id: `coach-${Date.now()}`,
      message,
      timestamp: new Date(),
      context: 'morning-start',
      intensity: userMetrics.streak > 7 ? 'intense' : 'moderate'
    };

    this.conversationHistory.push(advice);
    return advice;
  }

  /**
   * Get midday boost - combat afternoon slump
   */
  async getMiddayBoost(userMetrics: UserMetrics, tasksCompleted: number): Promise<CoachAdvice> {
    const progressRatio = tasksCompleted / Math.max(userMetrics.tasksCompletedToday, 1);
    
    const message = progressRatio > 0.5
      ? `🚀 Halfway there! You're crushing it today. Keep the momentum!`
      : `💪 The afternoon slump is real, but you're stronger! Take a quick break and push forward.`;

    const advice: CoachAdvice = {
      id: `coach-${Date.now()}`,
      message,
      timestamp: new Date(),
      context: 'midday-boost',
      intensity: 'moderate'
    };

    this.conversationHistory.push(advice);
    return advice;
  }

  /**
   * Get streak milestone celebration
   */
  async getStreakMilestoneAdvice(streak: number): Promise<CoachAdvice> {
    let milestone = '';
    
    if (streak === 7) milestone = '🔥 A WEEK OF FIRE! You\'re unstoppable!';
    else if (streak === 30) milestone = '⛰️ ONE MONTH SUMMIT! You\'ve reached new heights!';
    else if (streak === 100) milestone = '🏔️ LEGEND STATUS! 100 days of relentless climbing!';
    else if (streak % 10 === 0) milestone = `🎯 ${streak} day streak! Your dedication is inspiring!`;
    else {
      const message = await generateAchievementMessage(
        `${streak}-Day Streak`,
        streak * 10,
        Math.floor(streak / 10)
      );
      milestone = message;
    }

    const advice: CoachAdvice = {
      id: `coach-${Date.now()}`,
      message: milestone,
      timestamp: new Date(),
      context: 'streak-milestone',
      intensity: 'intense'
    };

    this.conversationHistory.push(advice);
    return advice;
  }

  /**
   * Get context-aware task breakdown with AI
   */
  async getIntelligentTaskBreakdown(
    taskTitle: string,
    taskDescription?: string,
    userMetrics?: UserMetrics,
    completedTasks?: Task[]
  ): Promise<SubTask[]> {
    return breakdownTaskWithContext(
      taskTitle,
      taskDescription,
      userMetrics?.level,
      completedTasks
    );
  }

  /**
   * Analyze daily patterns and provide insights
   */
  async getDailyAnalysis(userMetrics: UserMetrics, completedTasks: Task[]): Promise<string> {
    const timeOfDay: 'morning' | 'afternoon' | 'evening' = this.getTimeOfDay() as any;

    const analysis = await analyzeUserPatterns(
      completedTasks,
      userMetrics.focusTimeToday,
      userMetrics.distractionsToday,
      timeOfDay,
      userMetrics.streak
    );

    return this.formatDailyAnalysis(analysis, userMetrics);
  }

  /**
   * Generate personalized recommendation for next task
   */
  async getNextTaskRecommendation(
    userMetrics: UserMetrics,
    recentTasks: Task[]
  ): Promise<string> {
    const currentFocusTime = userMetrics.focusTimeToday;
    const hasGoodMomentum = userMetrics.tasksCompletedToday > 2;

    if (currentFocusTime > 90 && hasGoodMomentum) {
      return '✨ You\'re in flow state! Keep riding this wave - take on your biggest challenge next!';
    }

    if (userMetrics.focusTimeToday > 120) {
      return '🛑 Your brain is tired. Time for a real break or switch to an easy task.';
    }

    if (userMetrics.tasksCompletedToday === 0) {
      return '🎯 Start with ONE small task. Build momentum from there!';
    }

    return '📈 Perfect pace! Pick a task slightly harder than your last one.';
  }

  /**
   * Get evening review motivation
   */
  async getEveningReview(userMetrics: UserMetrics, dailyWins: string[]): Promise<CoachAdvice> {
    const winsCount = dailyWins.length;
    const pointsEarned = userMetrics.focusTimeToday * 2; // rough calculation

    let message = `🌅 ${winsCount} wins today, ${pointsEarned} points earned!`;
    
    if (userMetrics.streak > 14) {
      message += ' Your consistency is legendary!';
    } else if (userMetrics.tasksCompletedToday === 0) {
      message = '💭 Rest is part of growth. Tomorrow is a fresh start!';
    }

    const advice: CoachAdvice = {
      id: `coach-${Date.now()}`,
      message,
      timestamp: new Date(),
      context: 'evening-review',
      intensity: 'gentle'
    };

    this.conversationHistory.push(advice);
    return advice;
  }

  /**
   * Get general encouragement
   */
  async getGeneralAdvice(userMetrics: UserMetrics): Promise<CoachAdvice> {
    const messages = [
      '🏔️ Every summit starts with a single step forward.',
      '💎 Progress over perfection - you\'re getting there.',
      '🌟 Your effort today shapes your tomorrow.',
      '⛰️ The mountain rewards the persistent climber.',
      '🔥 Small steps lead to big breakthroughs.'
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    const advice: CoachAdvice = {
      id: `coach-${Date.now()}`,
      message,
      timestamp: new Date(),
      context: 'general',
      intensity: 'moderate'
    };

    this.conversationHistory.push(advice);
    return advice;
  }

  /**
   * Get conversation history
   */
  getConversationHistory(limit: number = 10): CoachAdvice[] {
    return this.conversationHistory.slice(-limit);
  }

  /**
   * Clear old conversation history (keep last 50)
   */
  clearOldHistory(): void {
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(-50);
    }
  }

  // ========== PRIVATE HELPERS ==========

  private determinePsychographics(userMetrics: UserMetrics): CoachingProfile {
    let personalityType: CoachingProfile['personalityType'];
    let preferredStyle: CoachingProfile['preferredMotivationStyle'];

    // Determine personality type based on metrics
    if (userMetrics.streak > 30) {
      personalityType = 'steady';
    } else if (userMetrics.tasksCompletedToday > 5) {
      personalityType = 'ambitious';
    } else {
      personalityType = 'explorer';
    }

    // Determine motivation style
    if (userMetrics.totalXP > 5000) {
      preferredStyle = 'competitive';
    } else {
      preferredStyle = 'supportive';
    }

    return {
      userId: `user-${Date.now()}`,
      personalityType,
      preferredMotivationStyle: preferredStyle,
      peakProductivityHour: 10, // Morning
      bestDay: 'Monday',
      streakRecord: userMetrics.streak
    };
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  private generateMorningMessage(userMetrics: UserMetrics): string {
    if (userMetrics.streak === 0) {
      return '🌄 Fresh start! Let\'s build that first win today!';
    }

    if (userMetrics.streak > 7) {
      return `🔥 Day ${userMetrics.streak} of your streak! Let\'s keep climbing!`;
    }

    return '☀️ Good morning, climber! Ready to make progress today?';
  }

  private formatDailyAnalysis(analysis: any, userMetrics: UserMetrics): string {
    return `
📊 Daily Analysis:
${analysis.advice}

💪 Motivation Level: ${analysis.motivationLevel}
⏱️ Suggested Next Focus: ${analysis.suggestedFocusTime} min
🎯 Today's Insight: ${analysis.personalityInsight}
    `.trim();
  }
}

// Export singleton instance
export const coachingSystem = new CoachingSystem();
