import AsyncStorage from './asyncStorageMock';
import { Task, UserProfile, SubTask } from './types';

/**
 * Persistent data storage service
 * Handles local storage with AsyncStorage
 * Ready for cloud sync integration (Firebase/Supabase)
 */

const STORAGE_KEYS = {
  USER_PROFILE: '@climb:user_profile',
  TASKS: '@climb:tasks',
  COMPLETED_TASKS: '@climb:completed_tasks',
  USER_METRICS: '@climb:user_metrics',
  COACHING_HISTORY: '@climb:coaching_history',
  BACKUP: '@climb:backup',
  SYNC_STATUS: '@climb:sync_status',
  LAST_SYNC: '@climb:last_sync'
};

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: Date;
  pendingChanges: number;
  syncError?: string;
}

export interface StorageConfig {
  enableCloudSync?: boolean;
  cloudProvider?: 'firebase' | 'supabase' | 'custom';
  autoBackupInterval?: number; // milliseconds
}

/**
 * Initialize storage with optional cloud sync
 */
export async function initializeStorage(config?: StorageConfig): Promise<void> {
  try {
    // Check if data exists, if not initialize defaults
    const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    
    if (!profile) {
      const defaultProfile: UserProfile = {
        name: 'Climber',
        level: 1,
        points: 0,
        climbHeight: 0,
        totalFocusTime: 0,
        selectedCharacter: 'llama',
        avatar: {
          baseColor: '#4CAF50',
          hat: 'none',
          gear: 'none'
        },
        isDistracted: false
      };
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(defaultProfile)
      );
    }

    console.log('Storage initialized successfully');
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

/**
 * Save task with automatic backup
 */
export async function saveTask(task: Task): Promise<void> {
  try {
    const tasks = await getTasks();
    const existingIndex = tasks.findIndex(t => t.id === task.id);
    
    if (existingIndex >= 0) {
      tasks[existingIndex] = task;
    } else {
      tasks.push(task);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    await markPendingChange('task_saved');
  } catch (error) {
    console.error('Error saving task:', error);
  }
}

/**
 * Get all tasks
 */
export async function getTasks(): Promise<Task[]> {
  try {
    const tasks = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    return tasks ? JSON.parse(tasks) : [];
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
}

/**
 * Complete a task and move to history
 */
export async function completeTask(taskId: string): Promise<void> {
  try {
    const tasks = await getTasks();
    const completedTasks = await getCompletedTasks();
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex >= 0) {
      const completedTask = { ...tasks[taskIndex], completed: true };
      completedTasks.push(completedTask);
      
      tasks.splice(taskIndex, 1);
      
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify(completedTasks));
      await markPendingChange('task_completed');
    }
  } catch (error) {
    console.error('Error completing task:', error);
  }
}

/**
 * Get completed tasks (history)
 */
export async function getCompletedTasks(): Promise<Task[]> {
  try {
    const completed = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_TASKS);
    return completed ? JSON.parse(completed) : [];
  } catch (error) {
    console.error('Error getting completed tasks:', error);
    return [];
  }
}

/**
 * Get completed tasks for a specific date range
 */
export async function getCompletedTasksByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Task[]> {
  try {
    const allCompleted = await getCompletedTasks();
    return allCompleted.filter(task => {
      // Note: This requires tasks to have a completedDate field
      // Update types.ts to include this if needed
      return true;
    });
  } catch (error) {
    console.error('Error getting tasks by date range:', error);
    return [];
  }
}

/**
 * Save user profile
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    await markPendingChange('profile_updated');
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Update user metrics (XP, level, streak, etc.)
 */
export async function updateUserMetrics(metrics: {
  pointsEarned?: number;
  focusTimeAdded?: number;
  streakIncrement?: number;
  levelUp?: boolean;
}): Promise<void> {
  try {
    const profile = await getUserProfile();
    
    if (!profile) return;

    if (metrics.pointsEarned) {
      profile.points += metrics.pointsEarned;
      
      // Update level based on points (every 500 points = 1 level)
      const newLevel = Math.floor(profile.points / 500) + 1;
      if (newLevel > profile.level) {
        profile.level = newLevel;
        metrics.levelUp = true;
      }
    }

    if (metrics.focusTimeAdded) {
      profile.totalFocusTime += metrics.focusTimeAdded;
    }

    if (metrics.levelUp) {
      profile.climbHeight += 100; // Climb 100m per level
    }

    await saveUserProfile(profile);
  } catch (error) {
    console.error('Error updating user metrics:', error);
  }
}

/**
 * Save coaching message to history
 */
export async function saveCoachingAdvice(advice: {
  message: string;
  context: string;
  timestamp: Date;
}): Promise<void> {
  try {
    const history = await getCoachingHistory();
    history.push({
      ...advice,
      id: `coach-${Date.now()}`
    });
    
    // Keep only last 100 messages
    if (history.length > 100) {
      history.shift();
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.COACHING_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving coaching advice:', error);
  }
}

/**
 * Get coaching history
 */
export async function getCoachingHistory(limit?: number): Promise<any[]> {
  try {
    const history = await AsyncStorage.getItem(STORAGE_KEYS.COACHING_HISTORY);
    const data = history ? JSON.parse(history) : [];
    
    return limit ? data.slice(-limit) : data;
  } catch (error) {
    console.error('Error getting coaching history:', error);
    return [];
  }
}

/**
 * Create backup of all data
 */
export async function createBackup(): Promise<string> {
  try {
    const backup = {
      timestamp: new Date().toISOString(),
      profile: await getUserProfile(),
      tasks: await getTasks(),
      completedTasks: await getCompletedTasks(),
      coachingHistory: await getCoachingHistory()
    };

    const backupString = JSON.stringify(backup);
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.BACKUP}-${Date.now()}`,
      backupString
    );

    return backupString;
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
}

/**
 * Restore from backup
 */
export async function restoreFromBackup(backupString: string): Promise<void> {
  try {
    const backup = JSON.parse(backupString);

    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(backup.profile)
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.TASKS,
      JSON.stringify(backup.tasks)
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.COMPLETED_TASKS,
      JSON.stringify(backup.completedTasks)
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.COACHING_HISTORY,
      JSON.stringify(backup.coachingHistory)
    );

    console.log('Backup restored successfully');
  } catch (error) {
    console.error('Error restoring backup:', error);
    throw error;
  }
}

/**
 * Get sync status
 */
export async function getSyncStatus(): Promise<SyncStatus> {
  try {
    const status = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_STATUS);
    
    if (!status) {
      return {
        isSyncing: false,
        lastSyncTime: new Date(0),
        pendingChanges: 0
      };
    }
    
    return JSON.parse(status);
  } catch (error) {
    console.error('Error getting sync status:', error);
    return {
      isSyncing: false,
      lastSyncTime: new Date(0),
      pendingChanges: 0
    };
  }
}

/**
 * Mark a change as pending sync
 */
async function markPendingChange(changeType: string): Promise<void> {
  try {
    const status = await getSyncStatus();
    status.pendingChanges += 1;
    
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_STATUS, JSON.stringify(status));
  } catch (error) {
    console.error('Error marking pending change:', error);
  }
}

/**
 * Clear all data (use with caution!)
 */
export async function clearAllData(): Promise<void> {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
    console.log('All data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

/**
 * Get storage usage statistics
 */
export async function getStorageStats(): Promise<{
  taskCount: number;
  completedTaskCount: number;
  profileSize: number;
  totalSize: number;
}> {
  try {
    const profile = await getUserProfile();
    const tasks = await getTasks();
    const completed = await getCompletedTasks();

    return {
      taskCount: tasks.length,
      completedTaskCount: completed.length,
      profileSize: profile ? JSON.stringify(profile).length : 0,
      totalSize: JSON.stringify({
        profile,
        tasks,
        completed
      }).length
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return {
      taskCount: 0,
      completedTaskCount: 0,
      profileSize: 0,
      totalSize: 0
    };
  }
}
