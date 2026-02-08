import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from './asyncStorageMock';
import { trackEvent } from './analyticsService';
import { FocusSession } from './types';
import { sendFocusModeWarning } from './notificationService';

// Re-export for convenience
export type { FocusSession };

interface FocusSessionState {
  isActive: boolean;
  currentSession: FocusSession | null;
  appState: AppStateStatus;
  lastBackground: number | null;
}

const FOCUS_STORAGE_KEY = 'focus_sessions';
const FOCUS_CONFIG_KEY = 'focus_mode_config';

let focusModeEnabled = true; // default enabled

export const isFocusModeEnabled = async (): Promise<boolean> => {
  try {
    const raw = await AsyncStorage.getItem(FOCUS_CONFIG_KEY);
    if (!raw) return focusModeEnabled;
    const cfg = JSON.parse(raw);
    return !!cfg.enabled;
  } catch (error) {
    return focusModeEnabled;
  }
};

export const setFocusModeEnabled = async (enabled: boolean): Promise<void> => {
  try {
    focusModeEnabled = enabled;
    await AsyncStorage.setItem(FOCUS_CONFIG_KEY, JSON.stringify({ enabled }));
  } catch (error) {
    console.error('Error saving focus mode config:', error);
  }
};

// simple listener support for UI updates
type FocusModeListener = (enabled: boolean) => void;
const focusModeListeners: Set<FocusModeListener> = new Set();

export const addFocusModeListener = (fn: FocusModeListener) => {
  focusModeListeners.add(fn);
  return () => focusModeListeners.delete(fn);
};

const notifyFocusModeListeners = (enabled: boolean) => {
  focusModeListeners.forEach(fn => {
    try { fn(enabled); } catch (e) { /* ignore listener errors */ }
  });
};

// call listeners when setting
const originalSetFocusModeEnabled = setFocusModeEnabled;
export const _setFocusModeEnabledAndNotify = async (enabled: boolean) => {
  await originalSetFocusModeEnabled(enabled);
  try { await trackEvent('focus_mode.toggled', { enabled }); } catch (e) {}
  notifyFocusModeListeners(enabled);
};

let sessionState: FocusSessionState = {
  isActive: false,
  currentSession: null,
  appState: 'active',
  lastBackground: null,
};

let appStateSubscription: any = null;

/**
 * Initialize focus mode tracking
 */
export const initializeFocusMode = async () => {
  try {
    const stored = await AsyncStorage.getItem(FOCUS_STORAGE_KEY);
    if (!stored) {
      await AsyncStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify([]));
    }

    // load config
    try {
      const cfgRaw = await AsyncStorage.getItem(FOCUS_CONFIG_KEY);
      if (cfgRaw) {
        const cfg = JSON.parse(cfgRaw);
        focusModeEnabled = !!cfg.enabled;
      }
    } catch (e) {
      // ignore
    }

    // Set up app state listener
    if (!appStateSubscription) {
      appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    }
  } catch (error) {
    console.error('Error initializing focus mode:', error);
  }
};

/**
 * Handle app state changes (background/foreground)
 */
const handleAppStateChange = (state: AppStateStatus) => {
  if (!sessionState.isActive) return;
  if (!focusModeEnabled) return;

  if (state === 'background' || state === 'inactive') {
    // User left the app
    if (sessionState.currentSession) {
      sessionState.lastBackground = Date.now();
      sessionState.currentSession.exitCount += 1;
    }
  } else if (state === 'active') {
    // User returned to the app
    if (sessionState.currentSession && sessionState.lastBackground) {
      const timeAway = Date.now() - sessionState.lastBackground;
      sessionState.currentSession.appLeaveTimes.push({
        leftAt: sessionState.lastBackground,
        returnedAt: Date.now(),
      });
      sessionState.lastBackground = null;

      // Send notification warning
      const totalTimeAway = sessionState.currentSession.appLeaveTimes.reduce(
        (sum, leave) => sum + (leave.returnedAt - leave.leftAt),
        0
      );
      const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
      };

      sendFocusModeWarning(
        sessionState.currentSession.exitCount,
        sessionState.currentSession.presetName,
        formatTime(totalTimeAway)
      );
    }
  }

  sessionState.appState = state;
};

/**
 * Start a new focus session
 */
export const startFocusSession = (
  sessionId: string,
  presetName: string
): FocusSession => {
  const newSession: FocusSession = {
    id: `focus_${Date.now()}`,
    sessionId,
    startTime: Date.now(),
    totalFocusTime: 0,
    totalDuration: 0,
    appLeaveTimes: [],
    exitCount: 0,
    presetName,
    completed: false,
    pointsEarned: 0,
  };

  sessionState.isActive = true;
  sessionState.currentSession = newSession;
  sessionState.lastBackground = null;

  try { trackEvent('focus_session.started', { sessionId: newSession.id, presetName }); } catch (e) {}
  return newSession;
};

/**
 * End the current focus session
 */
export const endFocusSession = async (pointsEarned: number): Promise<FocusSession | null> => {
  if (!sessionState.currentSession) {
    return null;
  }

  const session = sessionState.currentSession;
  const endTime = Date.now();
  session.endTime = endTime;
  session.totalDuration = endTime - session.startTime;

  // Calculate actual focus time (total time - time away from app)
  let timeAwayTotal = 0;
  session.appLeaveTimes.forEach(leave => {
    timeAwayTotal += leave.returnedAt - leave.leftAt;
  });
  session.totalFocusTime = session.totalDuration - timeAwayTotal;
  session.completed = true;
  session.pointsEarned = pointsEarned;

  // Save to storage
  try {
    const stored = await AsyncStorage.getItem(FOCUS_STORAGE_KEY);
    const sessions: FocusSession[] = stored ? JSON.parse(stored) : [];
    sessions.push(session);
    await AsyncStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(sessions));
    try { await trackEvent('focus_session.ended', { sessionId: session.id, presetName: session.presetName, totalFocusTime: session.totalFocusTime, exitCount: session.exitCount, pointsEarned: session.pointsEarned }); } catch (e) {}
  } catch (error) {
    console.error('Error saving focus session:', error);
  }

  sessionState.isActive = false;
  sessionState.currentSession = null;
  sessionState.lastBackground = null;

  return session;
};

/**
 * Get the current focus session
 */
export const getCurrentFocusSession = (): FocusSession | null => {
  return sessionState.currentSession;
};

/**
 * Cancel the current session without saving
 */
export const abortFocusSession = () => {
  sessionState.isActive = false;
  sessionState.currentSession = null;
  sessionState.lastBackground = null;
};

/**
 * Get all completed focus sessions
 */
export const getAllFocusSessions = async (): Promise<FocusSession[]> => {
  try {
    const stored = await AsyncStorage.getItem(FOCUS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading focus sessions:', error);
    return [];
  }
};

/**
 * Get focus sessions for a specific date range
 */
export const getFocusSessionsByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<FocusSession[]> => {
  const allSessions = await getAllFocusSessions();
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  return allSessions.filter(session => {
    return session.startTime >= startTime && session.startTime <= endTime;
  });
};

/**
 * Get session statistics
 */
export const getFocusSessionStats = async (sessions?: FocusSession[]) => {
  const data = sessions || (await getAllFocusSessions());

  if (data.length === 0) {
    return {
      totalSessions: 0,
      totalFocusTime: 0,
      totalJeamTime: 0,
      averageFocusTime: 0,
      averageExitCount: 0,
      totalPointsEarned: 0,
    };
  }

  const totalFocusTime = data.reduce((sum, s) => sum + s.totalFocusTime, 0);
  const totalDuration = data.reduce((sum, s) => sum + s.totalDuration, 0);
  const totalExits = data.reduce((sum, s) => sum + s.exitCount, 0);
  const totalPoints = data.reduce((sum, s) => sum + s.pointsEarned, 0);

  return {
    totalSessions: data.length,
    totalFocusTime,
    totalDuration,
    averageFocusTime: totalFocusTime / data.length,
    averageExitCount: totalExits / data.length,
    totalPointsEarned: totalPoints,
  };
};

/**
 * Clear all focus sessions
 */
export const clearFocusSessions = async () => {
  try {
    await AsyncStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify([]));
    abortFocusSession();
  } catch (error) {
    console.error('Error clearing focus sessions:', error);
  }
};

/**
 * Cleanup on unmount
 */
export const disposeFocusMode = () => {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
  abortFocusSession();
};

// Auto-initialize when module loads
initializeFocusMode();
