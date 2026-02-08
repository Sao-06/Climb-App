import { TeamDashboard } from '@/components/TeamDashboard';
import { COLORS } from '@/lib/constants';
import { getUserProfile } from '@/lib/persistenceService';
import { UserProfile } from '@/lib/types';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text } from 'react-native';

export default function SocialScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // Get user profile from persistence service
      const profile = await getUserProfile();
      if (profile) {
        setUser(profile);
      } else {
        // Fallback default user
        setUser({
          name: 'Climber',
          level: 1,
          points: 0,
          climbHeight: 0,
          totalFocusTime: 0,
          selectedCharacter: 'llama',
          avatar: {
            baseColor: '#e2e8f0',
            hat: 'none',
            gear: 'none',
          },
          isDistracted: false,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Set default if there's an error
      setUser({
        name: 'Climber',
        level: 1,
        points: 0,
        climbHeight: 0,
        totalFocusTime: 0,
        selectedCharacter: 'llama',
        avatar: {
          baseColor: '#e2e8f0',
          hat: 'none',
          gear: 'none',
        },
        isDistracted: false,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Error loading profile</Text>
      </SafeAreaView>
    );
  }

  return <TeamDashboard user={user} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.slate500,
  },
});
