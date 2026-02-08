import { Store } from '@/components/Store';
import { COLORS } from '@/lib/constants';
import { UserProfile } from '@/lib/types';
import { useProfile } from '@/lib/profileContext';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function StoreScreen() {
  const { profile, updateProfile } = useProfile();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (profile) {
      setUser(profile);
    }
  }, [profile]);

  const handleUpdateAvatar = (update: Partial<UserProfile['avatar']>) => {
    if (!user) return;
    const next = {
      ...user,
      avatar: { ...user.avatar, ...update },
    };
    setUser(next);
    void updateProfile({ avatar: next.avatar });
  };

  const handleSpendPoints = (amount: number): boolean => {
    if (!user || user.points < amount) return false;
    const next = { ...user, points: user.points - amount };
    setUser(next);
    void updateProfile({ points: next.points });
    return true;
  };

  return (
    <View style={styles.container}>
      {user && (
        <Store
          user={user}
          onUpdateAvatar={handleUpdateAvatar}
          onSpendPoints={handleSpendPoints}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
});
