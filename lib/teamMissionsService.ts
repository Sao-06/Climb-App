import { getTeamById, updateTeam } from './teamService';
import { TeamMission } from './types';

/**
 * Team Missions Service
 * Handles team mission creation, tracking, and synchronization
 */

/**
 * Create individual mission for team members
 * Each member completes these independently but contributes to team progress
 */
export async function createTeamIndividualMission(
  teamId: string,
  title: string,
  description: string,
  points: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<TeamMission | null> {
  try {
    const team = await getTeamById(teamId);
    if (!team) return null;

    const mission: TeamMission = {
      id: `mission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      teamId,
      title,
      description,
      points,
      completed: false,
      subtasks: [],
      progress: 0,
      teamMembersCompleted: [],
      difficulty,
      createdAt: new Date(),
    };

    team.individualMissions.push(mission);
    await updateTeam(teamId, team);

    return mission;
  } catch (error) {
    console.error('Error creating individual mission:', error);
    return null;
  }
}

/**
 * Create shared mission for the entire team
 * Team works together to complete this mission
 */
export async function createTeamSharedMission(
  teamId: string,
  title: string,
  description: string,
  points: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  milestone?: {
    name: string;
    requiredProgress: number;
    reward: number;
  }
): Promise<TeamMission | null> {
  try {
    const team = await getTeamById(teamId);
    if (!team) return null;

    const mission: TeamMission = {
      id: `shared-mission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      teamId,
      title,
      description,
      points,
      completed: false,
      subtasks: [],
      progress: 0,
      teamMembersCompleted: [],
      difficulty,
      milestone,
      createdAt: new Date(),
    };

    team.sharedMissions.push(mission);
    await updateTeam(teamId, team);

    return mission;
  } catch (error) {
    console.error('Error creating shared mission:', error);
    return null;
  }
}

/**
 * Mark a member's individual mission as complete
 */
export async function completeIndividualMission(
  teamId: string,
  missionId: string,
  userId: string
): Promise<boolean> {
  try {
    const team = await getTeamById(teamId);
    if (!team) return false;

    const mission = team.individualMissions.find(m => m.id === missionId);
    if (!mission) return false;

    if (!mission.teamMembersCompleted.includes(userId)) {
      mission.teamMembersCompleted.push(userId);
    }

    // Update progress based on members completed
    const completionPercentage = (mission.teamMembersCompleted.length / team.members.length) * 100;
    mission.progress = Math.round(completionPercentage);

    if (mission.progress === 100) {
      mission.completed = true;
    }

    // Award points to team
    team.teamPoints += mission.points;

    await updateTeam(teamId, team);
    return true;
  } catch (error) {
    console.error('Error completing individual mission:', error);
    return false;
  }
}

/**
 * Update shared mission progress
 * Progress is tracked by percentage completion
 */
export async function updateSharedMissionProgress(
  teamId: string,
  missionId: string,
  userId: string,
  progressDelta: number // percentage increase
): Promise<TeamMission | null> {
  try {
    const team = await getTeamById(teamId);
    if (!team) return null;

    const mission = team.sharedMissions.find(m => m.id === missionId);
    if (!mission) return null;

    if (!mission.teamMembersCompleted.includes(userId)) {
      mission.teamMembersCompleted.push(userId);
    }

    mission.progress = Math.min(100, mission.progress + progressDelta);

    if (mission.progress === 100) {
      mission.completed = true;
      // Check for milestone unlock
      if (mission.milestone && mission.progress >= mission.milestone.requiredProgress) {
        team.teamPoints += mission.milestone.reward;
      }
    }

    // Award proportional points based on progress
    const pointsToAward = Math.floor((progressDelta / 100) * mission.points);
    team.teamPoints += pointsToAward;

    await updateTeam(teamId, team);
    return mission;
  } catch (error) {
    console.error('Error updating shared mission progress:', error);
    return null;
  }
}

/**
 * Get team missions (both individual and shared)
 */
export async function getTeamMissions(teamId: string): Promise<{
  individual: TeamMission[];
  shared: TeamMission[];
} | null> {
  try {
    const team = await getTeamById(teamId);
    if (!team) return null;

    return {
      individual: team.individualMissions,
      shared: team.sharedMissions,
    };
  } catch (error) {
    console.error('Error getting team missions:', error);
    return null;
  }
}

/**
 * Get member's mission progress in a team
 */
export async function getMemberMissionProgress(
  teamId: string,
  userId: string
): Promise<{
  completedIndividual: TeamMission[];
  inProgressIndividual: TeamMission[];
  teamContributions: TeamMission[];
} | null> {
  try {
    const team = await getTeamById(teamId);
    if (!team) return null;

    const completedIndividual = team.individualMissions.filter(
      m => m.teamMembersCompleted.includes(userId) && m.completed
    );

    const inProgressIndividual = team.individualMissions.filter(
      m => !m.teamMembersCompleted.includes(userId) && !m.completed
    );

    const teamContributions = team.sharedMissions.filter(
      m => m.teamMembersCompleted.includes(userId)
    );

    return {
      completedIndividual,
      inProgressIndividual,
      teamContributions,
    };
  } catch (error) {
    console.error('Error getting member mission progress:', error);
    return null;
  }
}

/**
 * Reset daily missions (call this on a schedule)
 */
export async function resetDailyMissions(teamId: string): Promise<boolean> {
  try {
    const team = await getTeamById(teamId);
    if (!team) return false;

    // Reset daily individual missions
    team.individualMissions = team.individualMissions.filter(m => {
      // Keep missions that aren't marked as daily, or reset completed status
      if (m.title.includes('Daily')) {
        m.completed = false;
        m.teamMembersCompleted = [];
        m.progress = 0;
      }
      return true;
    });

    await updateTeam(teamId, team);
    return true;
  } catch (error) {
    console.error('Error resetting daily missions:', error);
    return false;
  }
}

/**
 * Get mission recommendations based on team level
 */
export function getMissionRecommendations(teamLevel: number): {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  basePoints: number;
}[] {
  const recommendations = [
    // Level 1-5: Easy missions
    {
      title: '🧗 First Steps',
      description: 'Complete any 3 individual tasks',
      difficulty: 'easy' as const,
      basePoints: 100,
    },
    {
      title: '⏱️ Focus Sprint',
      description: 'Team completes 10 Pomodoro sessions',
      difficulty: 'easy' as const,
      basePoints: 150,
    },
    // Level 5-10: Medium missions
    {
      title: '🏔️ Team Climb',
      description: 'Team reaches 1000m combined climb height',
      difficulty: 'medium' as const,
      basePoints: 300,
    },
    {
      title: '🔥 Week Warrior',
      description: 'Maintain 7-day Pomodoro streak',
      difficulty: 'medium' as const,
      basePoints: 500,
    },
    // Level 10+: Hard missions
    {
      title: '⛰️ Summit Push',
      description: 'All members complete level-up milestone',
      difficulty: 'hard' as const,
      basePoints: 1000,
    },
    {
      title: '🌟 Perfect Sync',
      description: 'All members complete the same mission',
      difficulty: 'hard' as const,
      basePoints: 750,
    },
  ];

  // Filter by team level
  if (teamLevel < 5) {
    return recommendations.slice(0, 2);
  } else if (teamLevel < 10) {
    return recommendations.slice(0, 4);
  }
  return recommendations;
}
