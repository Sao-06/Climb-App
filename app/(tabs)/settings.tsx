import { CharacterSelect } from '@/components/CharacterSelect';
import { COLORS } from '@/lib/constants';
import { CharacterType } from '@/lib/types';
import { useProfile } from '@/lib/profileContext';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { startAppUsageTracker, stopAppUsageTracker } from '@/lib/appUsageTracker';
import { getTrackerFocusConsent, setTrackerFocusConsent } from '@/lib/consentService';
import { initializeNotifications } from '@/lib/notificationService';
import { isFocusModeEnabled, setFocusModeEnabled } from '@/lib/focusModeService';

export default function SettingsScreen() {
  const { profile, updateProfile } = useProfile();
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>('llama');
  const [trackerEnabled, setTrackerEnabled] = useState(false);
  const [focusModeEnabled, setFocusModeEnabledState] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (profile) {
        setSelectedCharacter(profile.selectedCharacter);
      }
      const consent = await getTrackerFocusConsent();
      setTrackerEnabled(consent === 'granted');
      setFocusModeEnabledState(isFocusModeEnabled());
    };
    void load();
  }, [profile]);

  const toggleTracker = async (value: boolean) => {
    setTrackerEnabled(value);
    if (value) {
      await setTrackerFocusConsent('granted');
      await initializeNotifications();
      startAppUsageTracker();
    } else {
      await setTrackerFocusConsent('denied');
      stopAppUsageTracker();
    }
  };

  const toggleFocusMode = (value: boolean) => {
    setFocusModeEnabledState(value);
    setFocusModeEnabled(value);
  };

  const handleAppTracker = () => {
    Alert.alert('App Tracker', 'App usage tracking is active. Leaving the app deducts points and triggers an alert.');
  };

  const handleFocusMode = () => {
    Alert.alert('Focus Mode', 'Start a focus session from the Dashboard to enable focus protections and blocking.');
  };

  const handleSelectCharacter = async (type: CharacterType) => {
    setSelectedCharacter(type);
    await updateProfile({ selectedCharacter: type });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Character Selection</Text>
          <Text style={styles.sectionDescription}>
            Choose your partner for the upcoming ascent. Each explorer brings their own spirit.
          </Text>
          <CharacterSelect
            selected={selectedCharacter}
            onSelect={handleSelectCharacter}
          />
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Game Controls</Text>
            <Text style={styles.infoText}>
              • Use the Dashboard tab to track your climb and start focus sessions{'\n'}
              • Complete missions in the Missions tab to earn XP{'\n'}
              • Customize your character in the Basecamp shop{'\n'}
              • When you go away during a focus session, you&apos;ll lose points
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={handleAppTracker}>
              <Text style={styles.actionTitle}>App Tracker</Text>
              <Text style={styles.actionSubtitle}>Track exits and apply penalties</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={handleFocusMode}>
              <Text style={styles.actionTitle}>Focus Mode</Text>
              <Text style={styles.actionSubtitle}>Jump to Dashboard to start</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.toggleCard}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextBlock}>
                <Text style={styles.infoTitle}>App Tracker</Text>
                <Text style={styles.infoText}>Deduct points and alert when you leave the app.</Text>
              </View>
              <Switch value={trackerEnabled} onValueChange={toggleTracker} thumbColor={COLORS.primary} />
            </View>
            <View style={styles.divider} />
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextBlock}>
                <Text style={styles.infoTitle}>Focus Mode</Text>
                <Text style={styles.infoText}>Allow focus protections to run during sessions.</Text>
              </View>
              <Switch value={focusModeEnabled} onValueChange={toggleFocusMode} thumbColor={COLORS.secondary} />
            </View>
          </View>

          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>Tips for Success</Text>
            <Text style={styles.tipsText}>
              • Start with the Classic Pomodoro preset (25 min focus){'\n'}
              • Break down large tasks into manageable subtasks{'\n'}
              • Reach new peaks to level up and unlock achievements{'\n'}
              • Stay focused - distractions have real consequences!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.slate800,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  sectionDescription: {
    fontSize: 13,
    color: COLORS.slate400,
    marginBottom: 16,
    lineHeight: 20,
    fontWeight: '500',
  },
  infoSection: {
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleTextBlock: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.slate200,
    marginVertical: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  primaryButton: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  secondaryButton: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.slate800,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.slate500,
    lineHeight: 18,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.slate800,
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.slate800,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.slate500,
    lineHeight: 20,
    fontWeight: '500',
  },
  tipsText: {
    fontSize: 12,
    color: COLORS.slate500,
    lineHeight: 20,
    fontWeight: '500',
  },
});
