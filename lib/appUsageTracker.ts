import { AppState, AppStateStatus } from 'react-native';

import { getOrCreateUserProfile, saveUserProfile } from './persistenceService';
import { initializeNotifications, sendAppExitPenaltyNotification } from './notificationService';

const POINTS_PENALTY = 10;

let appState: AppStateStatus = AppState.currentState;
let subscription: ReturnType<typeof AppState.addEventListener> | null = null;
let notificationsReady = false;

const ensureNotifications = async () => {
  if (notificationsReady) return;
  notificationsReady = await initializeNotifications();
};

const applyExitPenalty = async () => {
  await ensureNotifications();
  const profile = await getOrCreateUserProfile();
  const nextPoints = Math.max(0, (profile.points ?? 0) - POINTS_PENALTY);
  await saveUserProfile({ ...profile, points: nextPoints });
  await sendAppExitPenaltyNotification(POINTS_PENALTY);
};

const handleAppStateChange = (nextState: AppStateStatus) => {
  if (appState === 'active' && (nextState === 'inactive' || nextState === 'background')) {
    void applyExitPenalty();
  }
  appState = nextState;
};

export const startAppUsageTracker = () => {
  if (subscription) return;
  subscription = AppState.addEventListener('change', handleAppStateChange);
};

export const stopAppUsageTracker = () => {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
};
