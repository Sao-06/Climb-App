import { COLORS } from '@/lib/constants';
import { breakdownTask } from '@/lib/geminiService';
import { Task } from '@/lib/types';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface TaskBoardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onPointsChange: (amount: number) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  setTasks,
  onPointsChange
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isBreakingDown, setIsBreakingDown] = useState(false);

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    setIsBreakingDown(true);
    const subtasks = await breakdownTask(newTaskTitle);

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      subtasks: subtasks,
      points: subtasks.reduce((acc, s) => acc + s.points, 0),
      completed: false
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setIsBreakingDown(false);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const newSubtasks = task.subtasks.map(s => {
            if (s.id === subtaskId) {
              if (!s.completed) onPointsChange(s.points);
              return { ...s, completed: !s.completed };
            }
            return s;
          });
          const allCompleted = newSubtasks.every(s => s.completed);
          return { ...task, subtasks: newSubtasks, completed: allCompleted };
        }
        return task;
      })
    );
  };

  const renderTask = ({ item: task }: { item: Task }) => (
    <View
      style={[
        styles.taskCard,
        task.completed && styles.taskCardCompleted
      ]}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <Text
            style={[
              styles.taskTitle,
              task.completed && styles.taskTitleCompleted
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          <Text style={styles.taskPoints}>Potential: {task.points} XP</Text>
        </View>
        {task.completed && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>Peak Conquered</Text>
          </View>
        )}
      </View>

      <View style={styles.subtasksContainer}>
        {task.subtasks.map(subtask => (
          <TouchableOpacity
            key={subtask.id}
            onPress={() => toggleSubtask(task.id, subtask.id)}
            style={[
              styles.subtaskItem,
              subtask.completed && styles.subtaskCompleted
            ]}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                subtask.completed && styles.checkboxCompleted
              ]}
            >
              {subtask.completed && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text
              style={[
                styles.subtaskTitle,
                subtask.completed && styles.subtaskTitleCompleted
              ]}
            >
              {subtask.title}
            </Text>
            <Text style={styles.subtaskPoints}>+{subtask.points}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Mission Control</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="What mountain are we moving today?"
              placeholderTextColor={COLORS.slate400}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              editable={!isBreakingDown}
              multiline
            />
            <TouchableOpacity
              onPress={addTask}
              disabled={isBreakingDown || !newTaskTitle.trim()}
              style={[
                styles.addButton,
                (isBreakingDown || !newTaskTitle.trim()) && styles.addButtonDisabled
              ]}
              activeOpacity={0.8}
            >
              {isBreakingDown ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.addButtonText}>BREAK DOWN</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Tasks List */}
        {tasks.length > 0 ? (
          <FlatList
            data={tasks}
            renderItem={renderTask}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            nestedScrollEnabled={false}
            contentContainerStyle={styles.tasksListContainer}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No active expeditions. Start by breaking down a task!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.slate800,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.slate800,
    maxHeight: 80,
    padding: 0,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.slate300,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  tasksListContainer: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskCardCompleted: {
    borderLeftColor: COLORS.secondary,
    opacity: 0.7,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  taskTitleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.slate800,
    marginBottom: 4,
  },
  taskTitleCompleted: {
    color: COLORS.slate400,
    textDecorationLine: 'line-through',
  },
  taskPoints: {
    fontSize: 12,
    color: COLORS.slate500,
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: COLORS.secondary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: 0.3,
  },
  subtasksContainer: {
    gap: 8,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.slate50,
    borderRadius: 12,
  },
  subtaskCompleted: {
    backgroundColor: COLORS.secondary + '15',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.slate300,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 14,
    color: COLORS.slate700,
    fontWeight: '500',
  },
  subtaskTitleCompleted: {
    color: COLORS.secondary,
    textDecorationLine: 'line-through',
  },
  subtaskPoints: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.slate500,
    opacity: 0.7,
  },
  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: COLORS.slate50,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.slate200,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.slate400,
    fontWeight: '600',
    textAlign: 'center',
  },
});
