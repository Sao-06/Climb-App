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
