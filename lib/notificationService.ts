import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
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
 * Play alarm sound for 10 seconds using vibration and system sounds
 */
async function playAlarmSound(): Promise<void> {
  try {
    // Set audio mode to allow sound to play even in silent mode
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });

    // Play system notification sound multiple times for ~10 seconds
    const alarmDuration = 10000; // 10 seconds
    const startTime = Date.now();
    const beepCount = 5;

    for (let i = 0; i < beepCount; i++) {
      if (Date.now() - startTime > alarmDuration) break;

      try {
        // Play haptic feedback (strong vibration)
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        // Try to play a system sound
        try {
          const { sound } = await Audio.Sound.createAsync({ 
            uri: Platform.select({
              ios: 'system_sound_id://1025', // Alarm sound on iOS
              android: 'android.resource://com.android.systemui/raw/notification'
            })
          });
          
          await sound.playAsync();
          await new Promise(resolve => setTimeout(resolve, 1500));
          await sound.unloadAsync();
        } catch (soundError) {
          // If system sound fails, continue with just haptics
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (error) {
        // Silent failure if haptics not available
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Delay between alarms
      if (i < beepCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error('Error playing alarm sound:', error);
  }
}

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
    // Send notification
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

    // Play alarm sound for 10 seconds
    await playAlarmSound();
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
 * Send XP earned notification
 */
export async function sendXPEarnedNotification(amount: number): Promise<void> {
  try {
    // Play success haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Send notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⭐ XP Earned!',
        body: `+${amount} XP - Great job completing that task!`,
        sound: 'default',
        data: { type: 'xp-earned', amount },
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error sending XP notification:', error);
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
