import { Dashboard } from '@/components/Dashboard';
import { COLORS } from '@/lib/constants';
import { CharacterType, Task, UserProfile } from '@/lib/types';
import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  StyleSheet,
  View
} from 'react-native';

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDistracted, setIsDistracted] = useState(false);
  const [isFocusSessionActive, setIsFocusSessionActive] = useState(false);

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

  // Monitor app state for distractions
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isFocusSessionActive, isDistracted]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App has come to foreground
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

  return (
    <View style={styles.container}>
      <Dashboard
        user={user}
        onPointsChange={updatePoints}
        onHeightChange={updateHeight}
        onSessionStateChange={setIsFocusSessionActive}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
});
