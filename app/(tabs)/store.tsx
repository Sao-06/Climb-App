import { Store } from '@/components/Store';
import { COLORS } from '@/lib/constants';
import { UserProfile } from '@/lib/types';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function StoreScreen() {
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

  const handleUpdateAvatar = (update: Partial<UserProfile['avatar']>) => {
    setUser(prev => ({
      ...prev,
      avatar: { ...prev.avatar, ...update }
    }));
  };

  const handleSpendPoints = (amount: number): boolean => {
    if (user.points >= amount) {
      setUser(prev => ({ ...prev, points: prev.points - amount }));
      return true;
    }
    return false;
  };

  return (
    <View style={styles.container}>
      <Store
        user={user}
        onUpdateAvatar={handleUpdateAvatar}
        onSpendPoints={handleSpendPoints}
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
