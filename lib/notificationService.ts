import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export async function initializeNotifications(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
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

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    return true;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
}

export async function sendFocusModeWarning(
  exitCount: number,
  presetName: string
): Promise<void> {
  try {
    // Send notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Focus Mode Alert',
        body: `You left your ${presetName} session${exitCount > 1 ? ` (${exitCount} times)` : ''}. Stay focused!`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });

    // Play alarm sound
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {
      console.error('Haptics error:', e);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

export async function sendXPEarnedNotification(amount: number): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⭐ XP Earned!',
        body: `+${amount} XP - Great job!`,
        sound: 'default',
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error sending XP notification:', error);
  }
}

export async function sendAppExitPenaltyNotification(pointsLost: number): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Stay in the climb',
        body: `-${pointsLost} pts for leaving the app. Jump back in!`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });

    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg' },
      { shouldPlay: true, isLooping: true }
    );

    setTimeout(() => {
      void sound.unloadAsync();
    }, 10000);
  } catch (error) {
    console.error('Error sending app exit penalty notification:', error);
  }
}
