import { CharacterType, PomodoroPreset } from './types';

export const PRESETS: PomodoroPreset[] = [
  { id: 'classic', name: "Classic", focusMin: 25, shortBreakMin: 5, longBreakMin: 15, longBreakAfter: 4 },
  { id: 'short', name: "Short", focusMin: 15, shortBreakMin: 3, longBreakMin: 10, longBreakAfter: 4 },
  { id: 'deep', name: "Deep Work", focusMin: 50, shortBreakMin: 10, longBreakMin: 20, longBreakAfter: 2 },
  { id: 'study', name: "Study Mode", focusMin: 30, shortBreakMin: 5, longBreakMin: 15, longBreakAfter: 3 },
];

export interface CharacterData {
  id: CharacterType;
  name: string;
  description: string;
  color: string;
  emoji: string;
}

export const CHARACTERS: CharacterData[] = [
  { id: 'llama', name: 'Luna the Llama', description: 'Graceful and steady, Luna loves high-altitude ponchos.', color: '#F3E5AB', emoji: '🦙' },
  { id: 'leopard', name: 'Leo the Jaguar', description: 'Fast and focused, Leo uses the latest high-tech climbing gear.', color: '#FFD700', emoji: '🐆' },
  { id: 'guineapig', name: 'Gina the Guinea Pig', description: 'Small but mighty, Gina climbs in her favorite polka-dot dress.', color: '#C19A6B', emoji: '🐹' },
  { id: 'elephant', name: 'Ellie the Elephant', description: 'Wise and strong, Ellie wears traditional climbing silks.', color: '#A9A9A9', emoji: '🐘' },
];

export const COLORS = {
  primary: '#2563eb',
  secondary: '#10b981',
  danger: '#ef4444',
  mountain: '#334155',
  white: '#ffffff',
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
};
