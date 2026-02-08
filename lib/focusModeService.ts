import { AppState, AppStateStatus } from 'react-native';
import { sendFocusModeWarning } from './notificationService';

interface FocusSession {
  id: string;
  sessionId: string;
  startTime: number;
  exitCount: number;
  presetName: string;
}

let focusModeEnabled = true;
let currentSession: FocusSession | null = null;
let appState: AppStateStatus = 'active';
let appStateSubscription: any = null;
let lastBackgroundTime: number | null = null;

type AppExitListener = (exitCount: number) => void;
const appExitListeners: Set<AppExitListener> = new Set();

export const addAppExitListener = (fn: AppExitListener) => {
  appExitListeners.add(fn);
  return () => {
    appExitListeners.delete(fn);
  };
};

const notifyAppExitListeners = (exitCount: number) => {
  appExitListeners.forEach(fn => {
    try { fn(exitCount); } catch (e) { }
  });
};

const handleAppStateChange = (state: AppStateStatus) => {
  if (!currentSession || !focusModeEnabled) {
    appState = state;
    return;
  }

  if (state === 'background' || state === 'inactive') {
    if (currentSession) {
      currentSession.exitCount += 1;
      lastBackgroundTime = Date.now();

      sendFocusModeWarning(currentSession.exitCount, currentSession.presetName);
      notifyAppExitListeners(currentSession.exitCount);
    }
  } else if (state === 'active') {
    lastBackgroundTime = null;
  }

  appState = state;
};

export const initializeFocusMode = () => {
  if (!appStateSubscription) {
    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  }
};

export const startFocusSession = (sessionId: string, presetName: string): void => {
  currentSession = {
    id: `focus_${Date.now()}`,
    sessionId,
    startTime: Date.now(),
    exitCount: 0,
    presetName,
  };
};

export const endFocusSession = (): FocusSession | null => {
  const session = currentSession;
  currentSession = null;
  return session || null;
};

export const getCurrentFocusSession = (): FocusSession | null => currentSession;

export const setFocusModeEnabled = (enabled: boolean): void => {
  focusModeEnabled = enabled;
};

export const isFocusModeEnabled = (): boolean => focusModeEnabled;

export const disposeFocusMode = () => {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
  currentSession = null;
};
