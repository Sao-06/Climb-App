import { Climber } from '@/components/Climber';
import { COLORS, PRESETS } from '@/lib/constants';
import { getCoachAdvice } from '@/lib/geminiService';
import { PomodoroPreset, UserProfile } from '@/lib/types';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface DashboardProps {
  user: UserProfile;
  onPointsChange: (amount: number) => void;
  onHeightChange: (amount: number) => void;
  onSessionStateChange?: (isActive: boolean) => void;
  focusRequest?: { presetId: string; token: number } | null;
  onFocusRequestHandled?: () => void;
}

const { width, height } = Dimensions.get('window');

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onPointsChange,
  onHeightChange,
  onSessionStateChange,
  focusRequest,
  onFocusRequestHandled
}) => {
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<PomodoroPreset>(PRESETS[0]);
  const [advice, setAdvice] = useState("Loading motivation...");
  const [isMoving, setIsMoving] = useState(false);
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const prevHeight = useRef(user.climbHeight);
  const climberPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchAdvice = async () => {
      const msg = await getCoachAdvice(user.points, user.climbHeight);
      setAdvice(msg);
    };
    fetchAdvice();
  }, [user.level]);

  useEffect(() => {
    if (user.climbHeight !== prevHeight.current) {
      setIsMoving(true);
      const timer = setTimeout(() => setIsMoving(false), 2000);
      prevHeight.current = user.climbHeight;
      
      Animated.spring(climberPosition, {
        toValue: (user.climbHeight / 5000) * (height * 0.6),
        useNativeDriver: false,
      }).start();
      
      return () => clearTimeout(timer);
    }
  }, [user.climbHeight]);

  const playAlarmSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Create a simple alarm using Oscillator pattern simulation
      // For React Native, we'll use a different approach - play a beep tone
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/alarm.mp3'),
        { shouldPlay: true }
      ).catch(() => {
        // If alarm.mp3 doesn't exist, create a simple beep alternative
        return { sound: null };
      });

      soundRef.current = sound;
      if (sound) {
        await sound.playAsync();
        setTimeout(async () => {
          if (sound) {
            await sound.unloadAsync();
          }
        }, 10000);
      }
    } catch (error) {
      console.warn("Error playing alarm sound:", error);
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (activeTimer !== null) {
      onSessionStateChange?.(true);
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);
            setActiveTimer(null);
            onSessionStateChange?.(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer]);

  useEffect(() => {
    if (!focusRequest) return;
    if (activeTimer !== null) {
      onFocusRequestHandled?.();
      return;
    }

    const preset = PRESETS.find(p => p.id === focusRequest.presetId) || PRESETS[0];
    startSession(preset);
    onFocusRequestHandled?.();
  }, [focusRequest?.token]);

  const handleSessionComplete = () => {
    const focusMinutes = selectedPreset.focusMin;
    const pointsEarned = focusMinutes * 10;
    const heightGain = focusMinutes * 10;
    
    onPointsChange(pointsEarned);
    onHeightChange(heightGain);
  };

  const startSession = (preset: PomodoroPreset) => {
    setSelectedPreset(preset);
    setActiveTimer(preset.focusMin * 60); // Convert minutes to seconds
    setTimeLeft(preset.focusMin * 60);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const mountainProgress = (user.climbHeight / 5000) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Mountain Scene */}
        <View style={styles.mountainScene}>
          <View style={styles.mountainBackground}>
            <Text style={styles.peakLabel}>Peak Expedition • Target: 5000m</Text>
          </View>

          {/* Climber Animation */}
          <Animated.View
            style={[
              styles.climberPosition,
              {
                bottom: Animated.add(
                  climberPosition,
                  new Animated.Value(20)
                )
              },
              isMoving && styles.climberMoving
            ]}
          >
            <Climber
              type={user.selectedCharacter}
              avatar={user.avatar}
              isMoving={isMoving}
              size="md"
            />
            <View style={styles.nameLabel}>
              <Text style={styles.nameLabelText}>
                {user.name} • {user.climbHeight}m
              </Text>
            </View>
          </Animated.View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${mountainProgress}%` }
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>
                Current: {user.climbHeight}m
              </Text>
              <Text style={styles.progressLabel}>
                Next Peak: {Math.ceil((user.climbHeight + 1) / 1000) * 1000}m
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>XP EARNED</Text>
            <Text style={styles.statValue}>{user.points}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>MAX ALT</Text>
            <Text style={styles.statValue}>{user.climbHeight}m</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>LEVEL</Text>
            <Text style={styles.statValue}>{user.level}</Text>
          </View>
        </View>

        {/* Coach Advice */}
        <View style={styles.adviceBox}>
          <Text style={styles.adviceTitle}>Navigator's Feedback</Text>
          <Text style={styles.adviceText}>"{advice}"</Text>
        </View>

        {/* Timer Section */}
        <View style={styles.timerSection}>
          {activeTimer !== null ? (
            <View style={styles.timerActive}>
              <Text style={styles.timerDisplay}>{formatTime(timeLeft)}</Text>
              <Text style={styles.timerLabel}>
                ACTIVE: {selectedPreset.name}
              </Text>
              <TouchableOpacity
                onPress={() => setActiveTimer(null)}
                style={styles.abortButton}
              >
                <Text style={styles.abortButtonText}>ABORT TO BASECAMP</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.timerInactive}>
              <Text style={styles.timerTitle}>Prepare Ascent</Text>
              <ScrollView
                nestedScrollEnabled
                style={styles.presetsList}
                showsVerticalScrollIndicator={false}
              >
                {PRESETS.map(preset => (
                  <TouchableOpacity
                    key={preset.id}
                    onPress={() => setSelectedPreset(preset)}
                    style={[
                      styles.presetButton,
                      selectedPreset.id === preset.id && styles.presetSelected
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.presetContent}>
                      <Text style={styles.presetName}>{preset.name}</Text>
                      <Text style={styles.presetDetails}>
                        {preset.focusMin}m DEPTH • {preset.shortBreakMin}m RECOVERY
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.presetRadio,
                        selectedPreset.id === preset.id && styles.presetRadioSelected
                      ]}
                    >
                      {selectedPreset.id === preset.id && (
                        <View style={styles.presetRadioDot} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => startSession(selectedPreset)}
                style={styles.beginButton}
                activeOpacity={0.8}
              >
                <Text style={styles.beginButtonText}>BEGIN ASCENT</Text>
                <Text style={styles.beginButtonArrow}>→</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  scrollView: {
    flex: 1,
  },
  mountainScene: {
    height: height * 0.5,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: 20,
  },
  mountainBackground: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  peakLabel: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  climberPosition: {
    alignItems: 'center',
    zIndex: 10,
  },
  climberMoving: {
    transform: [{ scale: 1.1 }],
  },
  nameLabel: {
    marginTop: 12,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  nameLabelText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 10,
    right: 16,
    width: 200,
  },
  progressTrack: {
    height: 12,
    backgroundColor: COLORS.white + '40',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.white + '20',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.white + '99',
    letterSpacing: 0.3,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.slate400,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.slate800,
  },
  adviceBox: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.slate800 + 'CC',
    borderRadius: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  adviceTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.slate400,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.white,
    lineHeight: 20,
  },
  timerSection: {
    marginHorizontal: 16,
    marginVertical: 12,
    marginBottom: 24,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  timerActive: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  timerDisplay: {
    fontSize: 56,
    fontWeight: '900',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier New',
    letterSpacing: -2,
    marginBottom: 12,
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.slate400,
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  abortButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: COLORS.slate900,
    borderRadius: 14,
    alignItems: 'center',
  },
  abortButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  timerInactive: {
    padding: 16,
  },
  timerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.slate800,
    letterSpacing: 0.15,
    marginBottom: 12,
    textAlign: 'center',
  },
  presetsList: {
    marginBottom: 12,
    maxHeight: 200,
  },
  presetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginVertical: 6,
    backgroundColor: COLORS.slate50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.slate100,
  },
  presetSelected: {
    backgroundColor: COLORS.primary + '0F',
    borderColor: COLORS.primary,
  },
  presetContent: {
    flex: 1,
  },
  presetName: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.slate800,
    marginBottom: 2,
  },
  presetDetails: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.slate400,
    letterSpacing: 0.2,
  },
  presetRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.slate200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetRadioSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  presetRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  beginButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  beginButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  beginButtonArrow: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.white,
  },
});
