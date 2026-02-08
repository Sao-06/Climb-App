import { CharacterSelect } from '@/components/CharacterSelect';
import AppBlocker from '@/components/AppBlocker';
import { isFocusModeEnabled, _setFocusModeEnabledAndNotify } from '@/lib/focusModeService';
import { COLORS } from '@/lib/constants';
import { CharacterType } from '@/lib/types';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function SettingsScreen() {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>('llama');
  const [focusModeEnabled, setFocusModeEnabledState] = useState<boolean>(true);
  const [showFocusHint, setShowFocusHint] = useState<boolean>(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const enabled = await isFocusModeEnabled();
        if (mounted) setFocusModeEnabledState(enabled);
      } catch (e) {}
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Selection</Text>
          <Text style={styles.sectionDescription}>
            Choose your partner for the upcoming ascent. Each explorer brings their own spirit.
          </Text>
          <CharacterSelect
            selected={selectedCharacter}
            onSelect={setSelectedCharacter}
          />
        </View>

        <View style={styles.focusToggleCard}>
          <View style={styles.focusToggleContent}>
            <View>
              <Text style={styles.focusToggleTitle}>Focus Mode</Text>
              <Text style={styles.focusToggleDesc}>
                When enabled, the app tracks if you leave during Pomodoro sessions and shows warnings.
              </Text>
            </View>
            <View>
              <Switch
                value={focusModeEnabled}
                onValueChange={async (v: boolean) => {
                  setFocusModeEnabledState(v);
                  try { 
                    await _setFocusModeEnabledAndNotify(v);
                    if (v) {
                      setShowFocusHint(true);
                      setTimeout(() => setShowFocusHint(false), 4000);
                    }
                  } catch (e) {}
                }}
                trackColor={{ false: COLORS.slate300, true: COLORS.secondary }}
                thumbColor={focusModeEnabled ? COLORS.white : COLORS.slate400}
              />
            </View>
          </View>
        </View>
        {showFocusHint && (
          <View style={styles.focusHint}>
            <Text style={styles.focusHintText}>Focus Mode enabled — you'll get warnings if you leave during a Pomodoro.</Text>
          </View>
        )}

        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Game Controls</Text>
            <Text style={styles.infoText}>
              • Use the Dashboard tab to track your climb and start focus sessions{'\n'}
              • Complete missions in the Missions tab to earn XP{'\n'}
              • Customize your character in the Basecamp shop{'\n'}
              • When you go away during a focus session, you'll lose points
            </Text>
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

        <View style={styles.appBlockerSection}>
          <AppBlocker />
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
  appBlockerSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginTop: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  focusToggleCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 0,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.slate100,
  },
  focusToggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  focusToggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.slate800,
  },
  focusToggleDesc: {
    fontSize: 12,
    color: COLORS.slate500,
  },
  focusHint: {
    marginHorizontal: 0,
    marginTop: 10,
    backgroundColor: COLORS.slate50,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    padding: 12,
    borderRadius: 10,
  },
  focusHintText: {
    color: COLORS.slate700,
    fontSize: 13,
    fontWeight: '600',
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
