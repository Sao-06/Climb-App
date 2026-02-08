export enum AppTab {
  DASHBOARD = 'DASHBOARD',
  TASKS = 'TASKS',
  STORE = 'STORE',
  SOCIAL = 'SOCIAL',
  SETTINGS = 'SETTINGS'
}

export type CharacterType = 'llama' | 'leopard' | 'guineapig' | 'elephant';

export interface PomodoroPreset {
  id: string;
  name: string;
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  longBreakAfter: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  subtasks: SubTask[];
  points: number;
  completed: boolean;
  createdAt?: Date;
  completedAt?: Date;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedMinutes?: number;
}

export interface SubTask {
  id: string;
  title: string;
  points: number;
  completed: boolean;
  estimatedMinutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface UserProfile {
  name: string;
  level: number;
  points: number;
  climbHeight: number; // in meters
  totalFocusTime: number; // in minutes
  selectedCharacter: CharacterType;
  avatar: {
    baseColor: string;
    hat: string;
    gear: string;
  };
  isDistracted: boolean;
}

export interface AppUsage {
  packageName: string;
  appName: string;
  millis: number;
  isProductive: boolean;
}

// ============================================
// Team-related Types
// ============================================

export interface TeamMember {
  userId: string;
  name: string;
  characterType: CharacterType;
  joinedAt: Date;
  role: 'owner' | 'admin' | 'member';
  individualMissionProgress: number; // percentage (0-100)
  pomodoroSessionsCompleted: number;
}

export interface TeamMission extends Task {
  teamId: string;
  progress: number; // percentage (0-100)
  teamMembersCompleted: string[]; // userIds who contributed
  milestone?: {
    name: string;
    requiredProgress: number;
    reward: number;
  };
}

export interface TeamStreak {
  currentStreak: number; // days
  allMembersConsecutiveDays: number; // consecutive days all members completed Pomodoro
  streakMultiplier: number; // 1.0 + (0.1 * currentStreak), capped at 3.0
  lastSessionDate: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: TeamMember[];
  isPublic: boolean;
  inviteCode?: string; // required for private teams
  maxMembers: number;
  createdAt: Date;
  updatedAt: Date;
  // Missions
  individualMissions: TeamMission[]; // each member does these
  sharedMissions: TeamMission[]; // team works together on these
  // Rewards & Streaks
  teamPoints: number;
  teamLevel: number;
  teamRewards: TeamReward[];
  streak: TeamStreak;
}

export interface TeamReward {
  id: string;
  name: string;
  description: string;
  points: number;
  icon: string;
  unlockedAt?: Date;
  milestone: number; // progress % required to unlock
}

export interface TeamInvite {
  id: string;
  teamId: string;
  code: string; // shareable code
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
  maxUses?: number;
  timesUsed: number;
  isActive: boolean;
}
