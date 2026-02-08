import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { COLORS } from '@/lib/constants';
import { FocusSession } from '@/lib/types';

interface FocusModeWarningProps {
  visible: boolean;
  focusSession: FocusSession | null;
  onContinueFocus: () => void;
  onAbortSession: () => void;
}

export const FocusModeWarning: React.FC<FocusModeWarningProps> = ({
  visible,
  focusSession,
  onContinueFocus,
  onAbortSession,
}) => {
  if (!focusSession) return null;

  const timeAway = focusSession.appLeaveTimes.reduce((sum, leave) => {
    return sum + (leave.returnedAt - leave.leftAt);
  }, 0);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onContinueFocus}
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.title}>Focus Mode Active</Text>
            </View>

            {/* Message */}
            <Text style={styles.message}>
              You're in a Pomodoro session! Switching away breaks your focus and streak.
            </Text>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Session Preset</Text>
                <Text style={styles.statValue}>{focusSession.presetName}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Times You Left</Text>
                <Text style={styles.statValue}>{focusSession.exitCount}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Time Away</Text>
                <Text style={styles.statValue}>{formatTime(timeAway)}</Text>
              </View>
            </View>

            {/* Warning Text */}
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Each time you leave, you lose focus and your team streak resets!
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.abortButton]}
                onPress={onAbortSession}
              >
                <Text style={styles.abortButtonText}>Exit Session</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.continueButton]}
                onPress={onContinueFocus}
              >
                <Text style={styles.continueButtonText}>Stay Focused</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  warningIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.slate900,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: COLORS.slate600,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: COLORS.slate50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.slate500,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.slate200,
    marginVertical: 12,
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  abortButton: {
    backgroundColor: COLORS.slate100,
    borderWidth: 1,
    borderColor: COLORS.slate300,
  },
  abortButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.slate600,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default FocusModeWarning;
