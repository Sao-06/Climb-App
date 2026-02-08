import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { startAppUsageTracker, stopAppUsageTracker } from '@/lib/appUsageTracker';
import { getTrackerFocusConsent, setTrackerFocusConsent } from '@/lib/consentService';
import { initializeNotifications } from '@/lib/notificationService';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    let mounted = true;

    const ensureConsent = async () => {
      const existing = await getTrackerFocusConsent();
      if (existing === 'granted') {
        await initializeNotifications();
        startAppUsageTracker();
        return;
      }

      Alert.alert(
        'Enable App Tracker & Focus Alerts',
        'Allow the app to track when you leave and send focus alerts with sound (you can change this later in Gear).',
        [
          {
            text: 'Not now',
            style: 'cancel',
            onPress: async () => {
              if (!mounted) return;
              await setTrackerFocusConsent('denied');
              stopAppUsageTracker();
            },
          },
          {
            text: 'Allow',
            onPress: async () => {
              if (!mounted) return;
              await setTrackerFocusConsent('granted');
              await initializeNotifications();
              startAppUsageTracker();
            },
          },
        ],
        { cancelable: false }
      );
    };

    void ensureConsent();

    return () => {
      mounted = false;
      stopAppUsageTracker();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
