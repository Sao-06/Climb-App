import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Notification Service for Focus Mode alerts
 */

// Configure how notifications should behave
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let isInitialized = false;

/**
 * Request notification permissions and setup
 */
export async function initializeNotifications(): Promise<boolean> {
  if (isInitialized) return true;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('focus-mode', {
        name: 'Focus Mode Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
    }

    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
}

/**
 * Send a local notification when user leaves during Pomodoro
 */
export async function sendFocusModeWarning(
  exitCount: number,
  presetName: string,
  timeAway: string
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Focus Mode Alert',
        body: `You left your ${presetName} session${exitCount > 1 ? ` ${exitCount} times` : ''}. Time away: ${timeAway}. Stay focused!`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'focus-mode-warning' },
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Send session completion notification
 */
export async function sendSessionCompleteNotification(
  presetName: string,
  points: number,
  focusPercentage: number
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Pomodoro Complete!',
        body: `${presetName} finished! Earned ${points} points. Focus: ${focusPercentage}%`,
        sound: 'default',
        data: { type: 'session-complete' },
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error sending completion notification:', error);
  }
}

/**
 * Cancel all pending notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}
