import { Dashboard } from '@/components/Dashboard';
import { getActiveBlockedApps } from '@/lib/appBlockerService';
import { COLORS } from '@/lib/constants';
import { subscribeDemoUsage } from '@/lib/demoEvents';
import {
    DEFAULT_SOCIAL_APP,
    SOCIAL_PENALTY_POINTS,
    applyDailyPenaltyIfNeeded,
    getAppLimitMinutes,
    getAppUsageMinutes,
    isLimitExceeded,
    markNudgeShown,
    recordAppUsage,
    wasNudgeShown
} from '@/lib/focusGuard';
import {
    clearFocusShield,
    getExternalAppUsageSnapshot,
    requestFocusShield,
    startBreakEnforcement
} from '@/lib/nativeScreenTime';
import { CharacterType, Task, UserProfile } from '@/lib/types';
import React, { useEffect, useRef, useState } from 'react';
import {
    AppState,
    AppStateStatus,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDistracted, setIsDistracted] = useState(false);
  const [isFocusSessionActive, setIsFocusSessionActive] = useState(false);
  const [showFocusNudge, setShowFocusNudge] = useState(false);
  const [focusRequest, setFocusRequest] = useState<{ presetId: string; token: number } | null>(null);
  const [instagramMinutes, setInstagramMinutes] = useState(0);
  const [usageMinutes, setUsageMinutes] = useState(0);
  const [blockedAppNames, setBlockedAppNames] = useState<string[]>([]);
  const [focusBypassActive, setFocusBypassActive] = useState(false);
  const bypassTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [user, setUser] = useState<UserProfile>({
    name: 'Explorer',
    level: 1,
    points: 150,
    climbHeight: 0,
    totalFocusTime: 0,
    selectedCharacter: 'llama',
    avatar: {
      baseColor: '#e2e8f0',
      hat: 'none',
      gear: 'none',
    },
    isDistracted: false
  });

  const appState = useRef(AppState.currentState);
  const distractionStartTime = useRef<number | null>(null);
  const backgroundStartTime = useRef<number | null>(null);

  const applyLimitEnforcement = async (appName: string, force: boolean) => {
    const minutesUsed = await getAppUsageMinutes(appName);
    const exceeded = await isLimitExceeded(appName);
    if (!exceeded || isFocusSessionActive) return;

    const nudged = await wasNudgeShown(appName);
    if (!force && nudged) return;

    const penalty = await applyDailyPenaltyIfNeeded(appName, SOCIAL_PENALTY_POINTS);
    if (penalty.applied && penalty.pointsLost > 0) {
      updatePoints(-penalty.pointsLost);
    }
    setInstagramMinutes(minutesUsed);
    setFocusRequest({ presetId: 'classic', token: Date.now() });
    setShowFocusNudge(true);
    if (!force) {
      await markNudgeShown(appName);
    }
  };

  const refreshUsageMinutes = async () => {
    const minutes = await getAppUsageMinutes(DEFAULT_SOCIAL_APP);
    setUsageMinutes(minutes);
  };

  // Monitor app state for distractions
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isFocusSessionActive, isDistracted]);

  useEffect(() => {
    void refreshUsageMinutes();
  }, []);

  useEffect(() => {
    return () => {
      if (bypassTimerRef.current) {
        clearTimeout(bypassTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeDemoUsage(async payload => {
      if (!payload.minutes || payload.minutes <= 0) return;
      await recordAppUsage(payload.appName, payload.minutes * 60000);
      await applyLimitEnforcement(payload.appName, true);
      await refreshUsageMinutes();
    });

    return () => unsubscribe();
  }, [isFocusSessionActive]);

  useEffect(() => {
    const syncFocusShield = async () => {
      if (isFocusSessionActive) {
        const blockedApps = await getActiveBlockedApps();
        const packages = blockedApps.map(app => app.packageName);
        const names = blockedApps.map(app => app.name);
        setBlockedAppNames(names);
        if (packages.length === 0) {
          await clearFocusShield();
          return;
        }
        await requestFocusShield(packages, undefined, true, names);
      } else {
        setBlockedAppNames([]);
        await clearFocusShield();
      }
    };

    void syncFocusShield();
  }, [isFocusSessionActive]);

  useEffect(() => {
    const startNativeBreakEnforcement = async () => {
      const blockedApps = await getActiveBlockedApps();
      const packages = blockedApps.map(app => app.packageName);
      if (packages.length === 0) return;
      await startBreakEnforcement(packages, getAppLimitMinutes(DEFAULT_SOCIAL_APP));
    };

    void startNativeBreakEnforcement();
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App has come to foreground
      const backgroundMillis = backgroundStartTime.current
        ? Date.now() - backgroundStartTime.current
        : 0;
      backgroundStartTime.current = null;

      const snapshot = await getExternalAppUsageSnapshot();
      if (snapshot.length > 0) {
        for (const usage of snapshot) {
          await recordAppUsage(usage.appName, usage.millis);
        }
      } else if (backgroundMillis > 0) {
        await recordAppUsage(DEFAULT_SOCIAL_APP, backgroundMillis);
      }

      await refreshUsageMinutes();

      await applyLimitEnforcement(DEFAULT_SOCIAL_APP, false);

      if (isFocusSessionActive && isDistracted) {
        const elapsedMinutes = Math.floor(
          (Date.now() - (distractionStartTime.current || Date.now())) / 60000
        );
        const pointsLost = Math.max(1, elapsedMinutes);
        updatePoints(-pointsLost);
        setIsDistracted(false);
      }
    } else if (nextAppState.match(/inactive|background/)) {
      // App has gone to background
      backgroundStartTime.current = Date.now();
      if (isFocusSessionActive) {
        setIsDistracted(true);
        distractionStartTime.current = Date.now();
      }
    }

    appState.current = nextAppState;
  };


  // Check and update level based on points
  useEffect(() => {
    const newLevel = Math.max(1, Math.floor(user.points / 1000) + 1);
    if (newLevel !== user.level) {
      setUser(prev => ({ ...prev, level: newLevel }));
    }
  }, [user.points]);

  const updatePoints = (amount: number) => {
    setUser(prev => ({ ...prev, points: Math.max(0, prev.points + amount) }));
  };

  const updateHeight = (amount: number) => {
    setUser(prev => ({ ...prev, climbHeight: prev.climbHeight + amount }));
  };

  const spendPoints = (amount: number): boolean => {
    if (user.points >= amount) {
      setUser(prev => ({ ...prev, points: prev.points - amount }));
      return true;
    }
    return false;
  };

  const updateAvatar = (update: Partial<UserProfile['avatar']>) => {
    setUser(prev => ({
      ...prev,
      avatar: { ...prev.avatar, ...update }
    }));
  };

  const selectCharacter = (type: CharacterType) => {
    setUser(prev => ({ ...prev, selectedCharacter: type }));
  };

  const handleFocusRedirect = () => {
    setShowFocusNudge(false);
  };

  const activateEmergencyBypass = () => {
    if (bypassTimerRef.current) {
      clearTimeout(bypassTimerRef.current);
    }
    setFocusBypassActive(true);
    updatePoints(-50);
    bypassTimerRef.current = setTimeout(() => {
      setFocusBypassActive(false);
    }, 2 * 60 * 1000);
  };

  return (
    <View style={styles.container}>
      <Dashboard
        user={user}
        onPointsChange={updatePoints}
        onHeightChange={updateHeight}
        onSessionStateChange={setIsFocusSessionActive}
        focusRequest={focusRequest}
        onFocusRequestHandled={() => setFocusRequest(null)}
        usageMinutes={usageMinutes}
        usageLimitMinutes={getAppLimitMinutes(DEFAULT_SOCIAL_APP)}
      />

      <Modal
        visible={showFocusNudge}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFocusNudge(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Time to Refocus</Text>
            <Text style={styles.modalText}>
              You've hit {instagramMinutes} min on Instagram today.
              The daily limit is {getAppLimitMinutes(DEFAULT_SOCIAL_APP)} min.
            </Text>
            <Text style={styles.modalText}>
              Focus mode was activated to protect your streak.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={handleFocusRedirect}
                style={styles.modalButtonPrimary}
              >
                <Text style={styles.modalButtonPrimaryText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isFocusSessionActive && !focusBypassActive}
        transparent
        animationType="fade"
      >
        <View style={styles.shieldOverlay}>
          <View style={styles.shieldCard}>
            <Text style={styles.shieldTitle}>Focus Shield Active</Text>
            <Text style={styles.shieldText}>
              Distracting apps are blocked while you climb.
            </Text>
            {blockedAppNames.length > 0 && (
              <Text style={styles.shieldList}>
                Blocked: {blockedAppNames.join(', ')}
              </Text>
            )}
            <View style={styles.shieldActions}>
              <TouchableOpacity
                onPress={activateEmergencyBypass}
                style={styles.shieldBypassButton}
              >
                <Text style={styles.shieldBypassText}>Emergency bypass (-50 XP)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.slate800,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  modalText: {
    fontSize: 13,
    color: COLORS.slate600,
    lineHeight: 20,
    marginBottom: 8,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalButtonSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.slate100,
  },
  modalButtonSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.slate600,
  },
  modalButtonPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  modalButtonPrimaryText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
  },
  shieldOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  shieldCard: {
    width: '100%',
    backgroundColor: COLORS.slate900,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.slate700,
  },
  shieldTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 8,
  },
  shieldText: {
    fontSize: 13,
    color: COLORS.slate200,
    lineHeight: 20,
    marginBottom: 10,
  },
  shieldList: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  shieldActions: {
    marginTop: 16,
  },
  shieldBypassButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
  },
  shieldBypassText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
});
