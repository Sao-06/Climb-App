import { COLORS } from '@/lib/constants';
import { emitDemoUsage } from '@/lib/demoEvents';
import { DEFAULT_SOCIAL_APP, getAppUsageMinutes } from '@/lib/focusGuard';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function InstagramDemoScreen() {
  const router = useRouter();
  const [minutesUsed, setMinutesUsed] = useState(0);

  const refreshUsage = async () => {
    const minutes = await getAppUsageMinutes(DEFAULT_SOCIAL_APP);
    setMinutesUsed(minutes);
  };

  useEffect(() => {
    void refreshUsage();
  }, []);

  const simulateScroll = async (minutes: number) => {
    emitDemoUsage(DEFAULT_SOCIAL_APP, minutes, 'instagram-demo');
    setTimeout(() => {
      void refreshUsage();
      router.replace('/(tabs)');
    }, 200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Instagram</Text>
        <Text style={styles.subTitle}>Demo Feed</Text>
      </View>

      <View style={styles.feedCard}>
        <Text style={styles.feedTitle}>Endless Scroll</Text>
        <Text style={styles.feedText}>
          This is a demo feed to simulate time spent. Use the buttons
          to add usage and trigger a focus redirect.
        </Text>
        <Text style={styles.feedStat}>Today: {minutesUsed} min</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => simulateScroll(5)}
        >
          <Text style={styles.actionText}>Simulate 5 min</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButtonDanger}
          onPress={() => simulateScroll(12)}
        >
          <Text style={styles.actionText}>Simulate 12 min</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButtonGhost}
          onPress={() => router.back()}
        >
          <Text style={styles.actionGhostText}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.6,
  },
  subTitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  feedCard: {
    backgroundColor: '#151515',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 6,
  },
  feedText: {
    fontSize: 13,
    color: '#d1d5db',
    lineHeight: 20,
    marginBottom: 12,
  },
  feedStat: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonDanger: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonGhost: {
    borderWidth: 1,
    borderColor: '#374151',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  actionGhostText: {
    color: '#d1d5db',
    fontWeight: '600',
    fontSize: 14,
  },
});
