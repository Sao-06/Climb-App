import AsyncStorage from './asyncStorageMock';
import { Team, TeamMember, TeamMission, TeamReward, TeamStreak, UserProfile } from './types';

/**
 * Team Management Service
 * Handles creation, joining, management of teams
 * Tracks team missions, rewards, and member streaks
 */

const TEAM_STORAGE_KEYS = {
  TEAMS: '@climb:teams',
  USER_TEAMS: '@climb:user_teams', // userId -> teamIds mapping
  TEAM_INVITES: '@climb:team_invites',
  TEAM_STREAKS: '@climb:team_streaks', // teamId -> streak data
};

/**
 * Simple UUID-like ID generator (React Native compatible)
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a simple invite code (6 characters)
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function normalizeCode(code?: string): string | undefined {
  if (!code) return undefined;
  return code.replace(/\s+/g, '').toUpperCase();
}

/**
 * Create a new team
 */
export async function createTeam(
  owner: UserProfile,
  teamName: string,
  description: string,
  isPublic: boolean,
  ownerEmail?: string,
  ownerNickname?: string,
  accessCode?: string,
  maxMembers: number = 10
): Promise<Team> {
  try {
    const teamId = generateId();
    const finalAccessCode = normalizeCode(accessCode) || generateInviteCode();
    const inviteCode = isPublic ? undefined : finalAccessCode;

    const ownerMember: TeamMember = {
      userId: owner.name, // Using name as userId (should be proper ID in production)
      name: owner.name,
      nickname: ownerNickname,
      email: ownerEmail,
      characterType: owner.selectedCharacter,
      joinedAt: new Date(),
      role: 'owner',
      individualMissionProgress: 0,
      pomodoroSessionsCompleted: 0,
    };

    const team: Team = {
      id: teamId,
      name: teamName,
      description,
      ownerId: ownerMember.userId,
      ownerEmail: ownerEmail,
      accessCode: finalAccessCode,
      members: [ownerMember],
      isPublic,
      inviteCode,
      maxMembers,
      createdAt: new Date(),
      updatedAt: new Date(),
      individualMissions: [],
      sharedMissions: [],
      teamPoints: 0,
      teamLevel: 1,
      teamRewards: [],
      streak: {
        currentStreak: 0,
        allMembersConsecutiveDays: 0,
        streakMultiplier: 1.0,
        lastSessionDate: new Date(),
      },
    };

    // Save team to storage
    const teams = await getAllTeams();
    teams.push(team);
    await AsyncStorage.setItem(TEAM_STORAGE_KEYS.TEAMS, JSON.stringify(teams));

    // Add mapping of user to team
    await addUserToTeam(ownerMember.userId, teamId);

    return team;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
}

/**
 * Get all teams (for public discovery)
 */
export async function getAllTeams(): Promise<Team[]> {
  try {
    const data = await AsyncStorage.getItem(TEAM_STORAGE_KEYS.TEAMS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting all teams:', error);
    return [];
  }
}

/**
 * Get teams a user is part of
 */
export async function getUserTeams(userId: string): Promise<Team[]> {
  try {
    const data = await AsyncStorage.getItem(`${TEAM_STORAGE_KEYS.USER_TEAMS}:${userId}`);
    const teamIds = data ? JSON.parse(data) : [];

    const allTeams = await getAllTeams();
    return allTeams.filter(t => teamIds.includes(t.id));
  } catch (error) {
    console.error('Error getting user teams:', error);
    return [];
  }
}

/**
 * Add user to team mapping
 */
async function addUserToTeam(userId: string, teamId: string): Promise<void> {
  try {
    const key = `${TEAM_STORAGE_KEYS.USER_TEAMS}:${userId}`;
    const data = await AsyncStorage.getItem(key);
    const teamIds = data ? JSON.parse(data) : [];

    if (!teamIds.includes(teamId)) {
      teamIds.push(teamId);
      await AsyncStorage.setItem(key, JSON.stringify(teamIds));
    }
  } catch (error) {
    console.error('Error adding user to team:', error);
  }
}

/**
 * Join a public team
 */
export async function joinPublicTeam(user: UserProfile, teamId: string): Promise<Team | null> {
  try {
    const teams = await getAllTeams();
    const team = teams.find(t => t.id === teamId);

    if (!team) {
      throw new Error('Team not found');
    }

    if (!team.isPublic) {
      throw new Error('Cannot join private team without invite code');
    }

    if (team.members.length >= team.maxMembers) {
      throw new Error('Team is full');
    }

    if (team.members.some(m => m.userId === user.name)) {
      throw new Error('Already a member of this team');
    }

    const newMember: TeamMember = {
      userId: user.name,
      name: user.name,
      characterType: user.selectedCharacter,
      joinedAt: new Date(),
      role: 'member',
      individualMissionProgress: 0,
      pomodoroSessionsCompleted: 0,
    };

    team.members.push(newMember);
    team.updatedAt = new Date();

    // Update storage
    const teamIndex = teams.findIndex(t => t.id === teamId);
    teams[teamIndex] = team;
    await AsyncStorage.setItem(TEAM_STORAGE_KEYS.TEAMS, JSON.stringify(teams));

    // Add user-to-team mapping
    await addUserToTeam(user.name, teamId);

    return team;
  } catch (error) {
    console.error('Error joining team:', error);
    return null;
  }
}

/**
 * Join a private team with invite code
 */
export async function joinPrivateTeamWithCode(
  user: UserProfile,
  inviteCode: string
): Promise<Team | null> {
  try {
    const teams = await getAllTeams();
    const normalized = normalizeCode(inviteCode);
    const team = teams.find(t => t.inviteCode === normalized || t.accessCode === normalized);

    if (!team) {
      throw new Error('Invalid invite code');
    }

    if (team.isPublic) {
      throw new Error('Use joinPublicTeam for public teams');
    }

    if (team.members.length >= team.maxMembers) {
      throw new Error('Team is full');
    }

    if (team.members.some(m => m.userId === user.name)) {
      throw new Error('Already a member of this team');
    }

    const newMember: TeamMember = {
      userId: user.name,
      name: user.name,
      characterType: user.selectedCharacter,
      joinedAt: new Date(),
      role: 'member',
      individualMissionProgress: 0,
      pomodoroSessionsCompleted: 0,
    };

    team.members.push(newMember);
    team.updatedAt = new Date();

    // Update storage
    const teamIndex = teams.findIndex(t => t.id === team.id);
    teams[teamIndex] = team;
    await AsyncStorage.setItem(TEAM_STORAGE_KEYS.TEAMS, JSON.stringify(teams));

    // Add user-to-team mapping
    await addUserToTeam(user.name, team.id);

    return team;
  } catch (error) {
    console.error('Error joining team with code:', error);
    return null;
  }
}

/**
 * Join a team with access code (works for any team)
 */
export async function joinTeamWithAccessCode(
  user: UserProfile,
  accessCode: string
): Promise<Team | null> {
  try {
    const teams = await getAllTeams();
    const normalized = normalizeCode(accessCode);
    const team = teams.find(t => t.accessCode === normalized || t.inviteCode === normalized);

    if (!team) {
      throw new Error('Invalid access code');
    }

    if (team.members.length >= team.maxMembers) {
      throw new Error('Team is full');
    }

    if (team.members.some(m => m.userId === user.name)) {
      throw new Error('Already a member of this team');
    }

    const newMember: TeamMember = {
      userId: user.name,
      name: user.name,
      characterType: user.selectedCharacter,
      joinedAt: new Date(),
      role: 'member',
      individualMissionProgress: 0,
      pomodoroSessionsCompleted: 0,
    };

    team.members.push(newMember);
    team.updatedAt = new Date();

    // Update storage
    const teamIndex = teams.findIndex(t => t.id === team.id);
    teams[teamIndex] = team;
    await AsyncStorage.setItem(TEAM_STORAGE_KEYS.TEAMS, JSON.stringify(teams));

    // Add user-to-team mapping
    await addUserToTeam(user.name, team.id);

    return team;
  } catch (error) {
    console.error('Error joining team with access code:', error);
    return null;
  }
}

/**
 * Get team by ID
 */
export async function getTeamById(teamId: string): Promise<Team | null> {
  try {
    const teams = await getAllTeams();
    return teams.find(t => t.id === teamId) || null;
  } catch (error) {
    console.error('Error getting team:', error);
    return null;
  }
}

/**
 * Leave a team
 */
export async function leaveTeam(userId: string, teamId: string): Promise<boolean> {
  try {
    const teams = await getAllTeams();
    const teamIndex = teams.findIndex(t => t.id === teamId);

    if (teamIndex === -1) {
      throw new Error('Team not found');
    }

    const team = teams[teamIndex];
    const memberIndex = team.members.findIndex(m => m.userId === userId);

    if (memberIndex === -1) {
      throw new Error('User not in team');
    }

    // Don't allow owner to leave without transferring ownership
    if (team.members[memberIndex].role === 'owner' && team.members.length > 1) {
      throw new Error('Owner must transfer ownership before leaving');
    }

    // If only member, delete team
    if (team.members.length === 1) {
      teams.splice(teamIndex, 1);
    } else {
      team.members.splice(memberIndex, 1);
      team.updatedAt = new Date();
      teams[teamIndex] = team;
    }

    await AsyncStorage.setItem(TEAM_STORAGE_KEYS.TEAMS, JSON.stringify(teams));

    // Remove user-to-team mapping
    const key = `${TEAM_STORAGE_KEYS.USER_TEAMS}:${userId}`;
    const data = await AsyncStorage.getItem(key);
    if (data) {
      const teamIds = JSON.parse(data);
      const filteredIds = teamIds.filter((id: string) => id !== teamId);
      await AsyncStorage.setItem(key, JSON.stringify(filteredIds));
    }

    return true;
  } catch (error) {
    console.error('Error leaving team:', error);
    return false;
  }
}

/**
 * Update team info
 */
export async function updateTeam(
  teamId: string,
  updates: Partial<Team>
): Promise<Team | null> {
  try {
    const teams = await getAllTeams();
    const teamIndex = teams.findIndex(t => t.id === teamId);

    if (teamIndex === -1) {
      throw new Error('Team not found');
    }

    teams[teamIndex] = {
      ...teams[teamIndex],
      ...updates,
      updatedAt: new Date(),
    };

    await AsyncStorage.setItem(TEAM_STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    return teams[teamIndex];
  } catch (error) {
    console.error('Error updating team:', error);
    return null;
  }
}

/**
 * Add team mission
 */
export async function addTeamMission(teamId: string, mission: TeamMission): Promise<boolean> {
  try {
    const teams = await getAllTeams();
    const team = teams.find(t => t.id === teamId);

    if (!team) {
      throw new Error('Team not found');
    }

    team.sharedMissions.push(mission);
    team.updatedAt = new Date();

    const teamIndex = teams.findIndex(t => t.id === teamId);
    teams[teamIndex] = team;
    await AsyncStorage.setItem(TEAM_STORAGE_KEYS.TEAMS, JSON.stringify(teams));

    return true;
  } catch (error) {
    console.error('Error adding team mission:', error);
    return false;
  }
}

/**
 * Update team streak (called when Pomodoro session completes)
 */
export async function updateTeamStreak(teamId: string, userId: string): Promise<TeamStreak | null> {
  try {
    const team = await getTeamById(teamId);
    if (!team) return null;

    const member = team.members.find(m => m.userId === userId);
    if (!member) return null;

    member.pomodoroSessionsCompleted += 1;

    const today = new Date();
    const lastSession = new Date(team.streak.lastSessionDate);
    const daysDiff = Math.floor(
      (today.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if all members completed sessions today
    const allMembersActive = team.members.every(m => m.pomodoroSessionsCompleted > 0);

    if (daysDiff === 1 && allMembersActive) {
      // Continue the streak
      team.streak.currentStreak += 1;
      team.streak.allMembersConsecutiveDays += 1;
    } else if (daysDiff > 1) {
      // Broke the streak
      team.streak.currentStreak = 1;
      team.streak.allMembersConsecutiveDays = 0;
    }

    // Update streak multiplier (capped at 3.0)
    team.streak.streakMultiplier = Math.min(3.0, 1.0 + team.streak.currentStreak * 0.1);
    team.streak.lastSessionDate = today;
    team.updatedAt = new Date();

    // Persist the updated team
    await updateTeam(teamId, team);

    return team.streak;
  } catch (error) {
    console.error('Error updating team streak:', error);
    return null;
  }
}

/**
 * Award team bonus points based on streak
 */
export async function awardTeamStreakBonus(teamId: string, basePoints: number): Promise<number> {
  try {
    const team = await getTeamById(teamId);
    if (!team) return basePoints;

    const bonusPoints = Math.floor(basePoints * (team.streak.streakMultiplier - 1.0));
    const totalPoints = basePoints + bonusPoints;

    team.teamPoints += totalPoints;

    // Level up every 5000 points
    const newLevel = Math.max(1, Math.floor(team.teamPoints / 5000) + 1);
    if (newLevel > team.teamLevel) {
      team.teamLevel = newLevel;
      // Unlock new reward on level up
      const newReward: TeamReward = {
        id: generateId(),
        name: `Team Level ${newLevel} Unlocked!`,
        description: `Reached team level ${newLevel}`,
        points: 500,
        icon: '🏆',
        unlockedAt: new Date(),
        milestone: newLevel,
      };
      team.teamRewards.push(newReward);
    }

    await updateTeam(teamId, team);
    return totalPoints;
  } catch (error) {
    console.error('Error awarding streak bonus:', error);
    return basePoints;
  }
}
