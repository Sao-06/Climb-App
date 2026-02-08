import { TaskBoard } from '@/components/TaskBoard';
import { COLORS } from '@/lib/constants';
import { Task } from '@/lib/types';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [points, setPoints] = useState(150);

  const handlePointsChange = (amount: number) => {
    setPoints(prev => Math.max(0, prev + amount));
  };

  return (
    <View style={styles.container}>
      <TaskBoard 
        tasks={tasks}
        setTasks={setTasks}
        onPointsChange={handlePointsChange}
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
