import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Analytics service to track AI performance and user insights
 */

export interface AnalyticsEvent {
  eventId: string;
  eventType: 'task_created' | 'task_completed' | 'ai_suggestion' | 'coach_message' | 'user_interaction';
  timestamp: Date;
  metadata: Record<string, any>;
  duration?: number; // milliseconds
}

export interface AIPerformanceMetric {
  taskBreakdownAccuracy: number; // 0-1
  coachAdviceRelevance: number; // 0-1
  taskCompletionRate: number; // 0-1
  averageTimeToComplete: number; // minutes
  userSatisfaction: number; // 0-1
}

const ANALYTICS_STORAGE_KEY = '@climb:analytics_events';
const PERFORMANCE_METRICS_KEY = '@climb:ai_performance';

/**
 * Log an analytics event
 */
export async function logEvent(
  eventType: AnalyticsEvent['eventType'],
  metadata: Record<string, any>,
  duration?: number
): Promise<void> {
  try {
    const events = await getAnalyticsEvents();
    
    const event: AnalyticsEvent = {
      eventId: `event-${Date.now()}`,
      eventType,
      timestamp: new Date(),
      metadata,
      duration
    };

    events.push(event);

    // Keep only last 1000 events
    if (events.length > 1000) {
      events.shift();
    }

    await AsyncStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Error logging event:', error);
  }
}

/**
 * Track task creation with AI breakdown
 */
export async function trackTaskCreation(
  taskTitle: string,
  subtaskCount: number,
  timeToBreakdown: number
): Promise<void> {
  await logEvent('task_created', {
    taskTitle,
    subtaskCount,
    timeToBreakdown
  });
}

/**
 * Track task completion
 */
export async function trackTaskCompletion(
  taskId: string,
  pointsEarned: number,
  timeSpent: number,
  difficulty: string
): Promise<void> {
  await logEvent('task_completed', {
    taskId,
    pointsEarned,
    timeSpent,
    difficulty
  });
}

/**
 * Track AI suggestion effectiveness
 */
export async function trackAISuggestion(
  suggestionType: string,
  wasUseful: boolean,
  userRating: number // 1-5
): Promise<void> {
  await logEvent('ai_suggestion', {
    suggestionType,
    wasUseful,
    userRating
  });
}

/**
 * Track coach message engagement
 */
export async function trackCoachMessage(
  messageContext: string,
  userEngagement: 'ignored' | 'viewed' | 'acted_on',
  timeToNextAction: number
): Promise<void> {
  await logEvent('coach_message', {
    messageContext,
    userEngagement,
    timeToNextAction
  });
}

/**
 * Get all analytics events
 */
export async function getAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  try {
    const events = await AsyncStorage.getItem(ANALYTICS_STORAGE_KEY);
    return events ? JSON.parse(events) : [];
  } catch (error) {
    console.error('Error getting analytics events:', error);
    return [];
  }
}

/**
 * Calculate AI performance metrics
 */
export async function calculateAIPerformanceMetrics(): Promise<AIPerformanceMetric> {
  try {
    const events = await getAnalyticsEvents();

    // Task creation accuracy (based on completion rate of AI-suggested tasks)
    const taskCreations = events.filter(e => e.eventType === 'task_created');
    const taskCompletions = events.filter(e => e.eventType === 'task_completed');
    
    const completionRate = taskCreations.length > 0 
      ? taskCompletions.length / taskCreations.length 
      : 0;

    // AI suggestion effectiveness
    const aiSuggestions = events.filter(e => e.eventType === 'ai_suggestion');
    const usefulSuggestions = aiSuggestions.filter(e => e.metadata.wasUseful);
    const suggestionRelevance = aiSuggestions.length > 0
      ? usefulSuggestions.length / aiSuggestions.length
      : 0.5;

    // Coach advice engagement
    const coachMessages = events.filter(e => e.eventType === 'coach_message');
    const actedOnMessages = coachMessages.filter(e => e.metadata.userEngagement === 'acted_on');
    const coachRelevance = coachMessages.length > 0
      ? actedOnMessages.length / coachMessages.length
      : 0.5;

    // Average time to complete tasks
    const avgTimeToComplete = taskCompletions.length > 0
      ? taskCompletions.reduce((sum, e) => sum + (e.metadata.timeSpent || 0), 0) / taskCompletions.length
      : 0;

    // User satisfaction (average rating of suggestions)
    const avgRating = aiSuggestions.length > 0
      ? aiSuggestions.reduce((sum, e) => sum + (e.metadata.userRating || 3), 0) / aiSuggestions.length / 5
      : 0.6;

    return {
      taskBreakdownAccuracy: completionRate,
      coachAdviceRelevance: coachRelevance,
      taskCompletionRate: completionRate,
      averageTimeToComplete,
      userSatisfaction: avgRating
    };
  } catch (error) {
    console.error('Error calculating AI performance:', error);
    return {
      taskBreakdownAccuracy: 0,
      coachAdviceRelevance: 0,
      taskCompletionRate: 0,
      averageTimeToComplete: 0,
      userSatisfaction: 0
    };
  }
}

/**
 * Get analytics summary for a time period
 */
export async function getAnalyticsSummary(hoursBack: number = 24): Promise<{
  tasksCreated: number;
  tasksCompleted: number;
  averageTaskPoints: number;
  totalFocusTime: number;
  mostProductiveHour: number;
  coachMessagesSent: number;
  aiSuggestionsGiven: number;
}> {
  try {
    const events = await getAnalyticsEvents();
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    const recentEvents = events.filter(e => new Date(e.timestamp) > cutoffTime);

    const tasksCreated = recentEvents.filter(e => e.eventType === 'task_created').length;
    const tasksCompleted = recentEvents.filter(e => e.eventType === 'task_completed').length;
    const coachMessages = recentEvents.filter(e => e.eventType === 'coach_message').length;
    const aiSuggestions = recentEvents.filter(e => e.eventType === 'ai_suggestion').length;

    // Calculate average task points
    const completedTasks = recentEvents.filter(e => e.eventType === 'task_completed');
    const avgTaskPoints = completedTasks.length > 0
      ? completedTasks.reduce((sum, e) => sum + (e.metadata.pointsEarned || 0), 0) / completedTasks.length
      : 0;

    // Calculate total focus time
    const totalFocusTime = completedTasks.reduce((sum, e) => sum + (e.metadata.timeSpent || 0), 0);

    // Find most productive hour
    const hourCounts: Record<number, number> = {};
    recentEvents.forEach(e => {
      const hour = new Date(e.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const mostProductiveHour = Object.entries(hourCounts).length > 0
      ? Object.entries(hourCounts).reduce((a, b) => b[1] > a[1] ? b : a)[0]
      : 0;

    return {
      tasksCreated,
      tasksCompleted,
      averageTaskPoints,
      totalFocusTime,
      mostProductiveHour: parseInt(mostProductiveHour as any),
      coachMessagesSent: coachMessages,
      aiSuggestionsGiven: aiSuggestions
    };
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    return {
      tasksCreated: 0,
      tasksCompleted: 0,
      averageTaskPoints: 0,
      totalFocusTime: 0,
      mostProductiveHour: 0,
      coachMessagesSent: 0,
      aiSuggestionsGiven: 0
    };
  }
}

/**
 * Clear analytics data (keep last N events)
 */
export async function pruneAnalyticsData(keepLastN: number = 500): Promise<void> {
  try {
    const events = await getAnalyticsEvents();
    
    if (events.length > keepLastN) {
      const pruned = events.slice(-keepLastN);
      await AsyncStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(pruned));
      console.log(`Pruned analytics: kept last ${keepLastN} events`);
    }
  } catch (error) {
    console.error('Error pruning analytics:', error);
  }
}

/**
 * Export analytics data for analysis
 */
export async function exportAnalyticsData(): Promise<string> {
  try {
    const events = await getAnalyticsEvents();
    const metrics = await calculateAIPerformanceMetrics();
    const summary = await getAnalyticsSummary(24);

    const exportData = {
      exportDate: new Date().toISOString(),
      eventCount: events.length,
      events,
      performanceMetrics: metrics,
      dailySummary: summary
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting analytics:', error);
    throw error;
  }
}
