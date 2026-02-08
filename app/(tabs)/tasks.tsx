import { TaskBoard } from '@/components/TaskBoard';
import { MissionGenerator } from '@/components/MissionGenerator';
import { COLORS } from '@/lib/constants';
import { appManager } from '@/lib/integrationExample';
import { Task, UserProfile } from '@/lib/types';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [points, setPoints] = useState(150);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        await appManager.initialize();
        // In a real app, you'd fetch the actual user profile
        // For now, using a default one
        setUserProfile({
          name: 'Climber',
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
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, []);

  const handlePointsChange = (amount: number) => {
    setPoints(prev => Math.max(0, prev + amount));
  };

  const handleMissionSelect = (mission: any) => {
    // Mission is already added via appManager
    // Refresh tasks list if needed
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MissionGenerator 
          onMissionSelect={handleMissionSelect}
          userProfile={userProfile}
        />
        <TaskBoard 
          tasks={tasks}
          setTasks={setTasks}
          onPointsChange={handlePointsChange}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  scrollContent: {
    padding: 16,
  }
});
