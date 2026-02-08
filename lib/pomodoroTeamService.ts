import { awardTeamStreakBonus, getTeamById, updateTeamStreak } from './teamService';

/**
 * Pomodoro Team Integration Service
 * Tracks Pomodoro sessions for team streak bonuses and rewards
 */

export interface PomodoroSessionResult {
  userId: string;
  teamId: string;
  sessionDuration: number; // minutes
  focusedMinutes: number; // actual productive minutes
  distractionsCount: number;
  completedSuccessfully: boolean;
}

/**
 * Record a completed Pomodoro session and update team streak
 */
export async function recordTeamPomodoroSession(
  sessionResult: PomodoroSessionResult
): Promise<{
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  streakMultiplier: number;
  newStreak: number;
} | null> {
  try {
    if (!sessionResult.completedSuccessfully) {
      return null;
    }

    // Update team streak
    const updatedStreak = await updateTeamStreak(sessionResult.teamId, sessionResult.userId);
    if (!updatedStreak) return null;

    // Calculate base points based on focused minutes
    const basePoints = Math.floor(sessionResult.focusedMinutes);

    // Award team bonus points based on streak multiplier
    const totalPointsResult = await awardTeamStreakBonus(
      sessionResult.teamId,
      basePoints
    );

    const bonusPoints = totalPointsResult - basePoints;

    return {
      basePoints,
      bonusPoints,
      totalPoints: totalPointsResult,
      streakMultiplier: updatedStreak.streakMultiplier,
      newStreak: updatedStreak.currentStreak,
    };
  } catch (error) {
    console.error('Error recording Pomodoro session:', error);
    return null;
  }
}

/**
 * Get team Pomodoro streak status
 */
export async function getTeamStreakStatus(teamId: string): Promise<{
  currentStreak: number;
  multiplier: number;
  allMembersConsecutive: number;
  estimatedBonusForSession: number;
  daysUntilNextMilestone: number;
} | null> {
  try {
    const team = await getTeamById(teamId);
    if (!team) return null;

    const { streak } = team;
    const TODAY_MINUTES = 25; // Standard Pomodoro

    // Estimate bonus for a typical 25-minute session
    const estimatedBase = TODAY_MINUTES;
    const estimatedBonus = Math.floor(estimatedBase * (streak.streakMultiplier - 1.0));

    return {
      currentStreak: streak.currentStreak,
      multiplier: streak.streakMultiplier,
      allMembersConsecutive: streak.allMembersConsecutiveDays,
      estimatedBonusForSession: estimatedBonus,
      daysUntilNextMilestone: Math.ceil(Math.max(0, 30 - streak.currentStreak / 7)), // 30 day goal
    };
  } catch (error) {
    console.error('Error getting streak status:', error);
    return null;
  }
}

/**
 * Check if team is eligible for streak bonus
 * All members must have completed a session today
 */
export async function checkTeamStreakEligibility(teamId: string): Promise<{
  isEligible: boolean;
  completedToday: string[]; // userIds
  missingMembers: string[];
  requiresSession: boolean;
} | null> {
  try {
    const team = await getTeamById(teamId);
    if (!team) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedToday = team.members
      .filter(m => {
        const lastSession = new Date(team.streak.lastSessionDate);
        lastSession.setHours(0, 0, 0, 0);
        return lastSession.getTime() === today.getTime();
      })
      .map(m => m.userId);

    const missingMembers = team.members
      .filter(m => !completedToday.includes(m.userId))
      .map(m => m.userId);

    const isEligible = missingMembers.length === 0 && team.members.length > 0;

    return {
      isEligible,
      completedToday,
      missingMembers,
      requiresSession: missingMembers.length > 0,
    };
  } catch (error) {
    console.error('Error checking streak eligibility:', error);
    return null;
  }
}

/**
 * Get milestone rewards for consecutive streaks
 */
export function getStreakMilestones(): {
  days: number;
  name: string;
  bonus: number;
  icon: string;
}[] {
  return [
    { days: 3, name: 'On Fire 🔥', bonus: 250, icon: '🔥' },
    { days: 7, name: 'Week Warrior 💪', bonus: 500, icon: '💪' },
    { days: 14, name: 'Fortnight Fighter 🏆', bonus: 1000, icon: '🏆' },
    { days: 30, name: 'Month Master 👑', bonus: 2000, icon: '👑' },
    { days: 60, name: 'Legendary Climber 🌟', bonus: 3000, icon: '🌟' },
    { days: 100, name: 'Unstoppable Force ⚡', bonus: 5000, icon: '⚡' },
  ];
}

/**
 * Check for milestone achievements
 */
export function checkStreakMilestone(
  currentStreak: number
): {
  name: string;
  bonus: number;
  icon: string;
} | null {
  const milestones = getStreakMilestones();
  return milestones.find(m => m.days === currentStreak) || null;
}

/**
 * Calculate expected points for a Pomodoro session based on streak
 */
export async function calculateSessionRewards(
  teamId: string,
  focusedMinutes: number
): Promise<{
  basePoints: number;
  streakBonus: number;
  totalPoints: number;
  multiplier: number;
} | null> {
  try {
    const team = await getTeamById(teamId);
    if (!team) return null;

    const basePoints = focusedMinutes;
    const streakBonus = Math.floor(basePoints * (team.streak.streakMultiplier - 1.0));
    const totalPoints = basePoints + streakBonus;

    return {
      basePoints,
      streakBonus,
      totalPoints,
      multiplier: team.streak.streakMultiplier,
    };
  } catch (error) {
    console.error('Error calculating rewards:', error);
    return null;
  }
}

/**
 * Get next streak milestone info
 */
export async function getNextStreakMilestoneInfo(teamId: string): Promise<{
  daysRemaining: number;
  nextMilestone: { days: number; name: string; bonus: number };
  progress: number; // percentage toward next milestone
} | null> {
  try {
    const team = await getTeamById(teamId);
    if (!team) return null;

    const milestones = getStreakMilestones();
    const nextMilestone = milestones.find(m => m.days > team.streak.currentStreak);

    if (!nextMilestone) {
      // Already achieved all milestones
      return {
        daysRemaining: 0,
        nextMilestone: milestones[milestones.length - 1],
        progress: 100,
      };
    }

    const daysRemaining = nextMilestone.days - team.streak.currentStreak;
    const progress = (team.streak.currentStreak / nextMilestone.days) * 100;

    return {
      daysRemaining,
      nextMilestone,
      progress,
    };
  } catch (error) {
    console.error('Error getting milestone info:', error);
    return null;
  }
}
