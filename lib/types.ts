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
  subtasks: SubTask[];
  points: number;
  completed: boolean;
}

export interface SubTask {
  id: string;
  title: string;
  points: number;
  completed: boolean;
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
  nickname?: string; // Optional display name
  email?: string; // Optional email
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
  ownerEmail?: string; // Owner's email
  accessCode?: string; // Team access code for joining
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
// ============================================
// App Blocker / Tracker Types
// ============================================

export interface BlockedApp {
  id: string;
  packageName: string; // e.g., 'com.facebook.katana'
  name: string; // e.g., 'Facebook'
  icon?: string; // emoji or image path
  isBlocked: boolean;
  category?: 'social' | 'games' | 'entertainment' | 'communication' | 'other';
  blockedAt?: Date;
}

export interface AppBlockerConfig {
  enabled: boolean;
  blockedApps: BlockedApp[];
  blockOnPomodoroStart: boolean; // Auto-block during Pomodoro
  allowEmergencyBypass: boolean; // Allow quick exit with warning
  emergencies: number; // Number of bypasses used
}

export interface AppUsageSession {
  id: string;
  appPackageName: string;
  appName: string;
  startTime: Date;
  endTime?: Date;
  durationMs: number;
  wasBlocked: boolean;
  pomodoroSessionId?: string; // Link to Pomodoro session
}