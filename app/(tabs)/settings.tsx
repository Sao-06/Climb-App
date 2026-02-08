import { CharacterSelect } from '@/components/CharacterSelect';
import AppBlocker from '@/components/AppBlocker';
import { COLORS } from '@/lib/constants';
import { CharacterType } from '@/lib/types';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>('llama');

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
