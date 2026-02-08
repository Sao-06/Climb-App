import { TaskBoard } from '@/components/TaskBoard';
import { DailyChecklistModal } from '@/components/DailyChecklistModal';
import { COLORS } from '@/lib/constants';
import { Task } from '@/lib/types';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [points, setPoints] = useState(150);
  const [checklistVisible, setChecklistVisible] = useState(false);

  const handlePointsChange = (amount: number) => {
    setPoints(prev => Math.max(0, prev + amount));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Missions & Daily Focus</Text>
          <Text style={styles.subtitle}>Break down missions or use today&apos;s checklist.</Text>
        </View>
        <TouchableOpacity
          onPress={() => setChecklistVisible(true)}
          style={styles.checklistButton}
          activeOpacity={0.85}
        >
          <Text style={styles.checklistButtonText}>Daily Checklist</Text>
        </TouchableOpacity>
      </View>

      <TaskBoard 
        tasks={tasks}
        setTasks={setTasks}
        onPointsChange={handlePointsChange}
      />

      <DailyChecklistModal
        visible={checklistVisible}
        onClose={() => setChecklistVisible(false)}
        onPointsEarned={handlePointsChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.slate800,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.slate500,
    marginTop: 2,
  },
  checklistButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  checklistButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
