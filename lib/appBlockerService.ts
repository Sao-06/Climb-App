import AsyncStorage from './asyncStorageMock';
import { BlockedApp, AppBlockerConfig, AppUsageSession } from './types';

/**
 * App Blocker & Tracker Service
 * Manages blocking distracting apps during Pomodoro sessions
 * Tracks app usage for analytics
 */

const APP_BLOCKER_KEYS = {
  BLOCKED_APPS: '@climb:blocked_apps',
  BLOCKER_CONFIG: '@climb:blocker_config',
  APP_USAGE_LOG: '@climb:app_usage_log',
};

/**
 * Initialize app blocker with default settings
 */
export async function initializeAppBlocker(): Promise<AppBlockerConfig> {
  try {
    const existing = await AsyncStorage.getItem(APP_BLOCKER_KEYS.BLOCKER_CONFIG);
    
    if (existing) {
      return JSON.parse(existing);
    }

    const defaultConfig: AppBlockerConfig = {
      enabled: true,
      blockOnPomodoroStart: true,
      allowEmergencyBypass: true,
      emergencies: 0,
      blockedApps: getDefaultBlockedApps(),
    };

    await AsyncStorage.setItem(
      APP_BLOCKER_KEYS.BLOCKER_CONFIG,
      JSON.stringify(defaultConfig)
    );

    return defaultConfig;
  } catch (error) {
    console.error('Error initializing app blocker:', error);
    return {
      enabled: true,
      blockOnPomodoroStart: true,
      allowEmergencyBypass: true,
      emergencies: 0,
      blockedApps: getDefaultBlockedApps(),
    };
  }
}

/**
 * Get default list of common distracting apps
 */
function getDefaultBlockedApps(): BlockedApp[] {
  return [
    {
      id: '1',
      packageName: 'com.facebook.katana',
      name: 'Facebook',
      icon: '👍',
      isBlocked: true,
      category: 'social',
    },
    {
      id: '2',
      packageName: 'com.instagram.android',
      name: 'Instagram',
      icon: '📷',
      isBlocked: true,
      category: 'social',
    },
    {
      id: '3',
      packageName: 'com.twitter.android',
      name: 'X (Twitter)',
      icon: '𝕏',
      isBlocked: true,
      category: 'social',
    },
    {
      id: '4',
      packageName: 'com.tiktok.android',
      name: 'TikTok',
      icon: '🎵',
      isBlocked: true,
      category: 'entertainment',
    },
    {
      id: '5',
      packageName: 'com.discord',
      name: 'Discord',
      icon: '💬',
      isBlocked: false,
      category: 'communication',
    },
    {
      id: '6',
      packageName: 'com.supercell.clashofclans',
      name: 'Clash of Clans',
      icon: '⚔️',
      isBlocked: true,
      category: 'games',
    },
    {
      id: '7',
      packageName: 'com.levelinfinite.pubgmobile',
      name: 'PUBG Mobile',
      icon: '🎮',
      isBlocked: true,
      category: 'games',
    },
    {
      id: '8',
      packageName: 'com.spotify.music',
      name: 'Spotify',
      icon: '🎧',
      isBlocked: false,
      category: 'entertainment',
    },
  ];
}

/**
 * Get current blocker configuration
 */
export async function getBlockerConfig(): Promise<AppBlockerConfig> {
  try {
    const config = await AsyncStorage.getItem(APP_BLOCKER_KEYS.BLOCKER_CONFIG);
    return config ? JSON.parse(config) : await initializeAppBlocker();
  } catch (error) {
    console.error('Error getting blocker config:', error);
    return await initializeAppBlocker();
  }
}

/**
 * Toggle app blocking on/off
 */
export async function toggleAppBlocker(enabled: boolean): Promise<AppBlockerConfig> {
  try {
    const config = await getBlockerConfig();
    config.enabled = enabled;
    await AsyncStorage.setItem(APP_BLOCKER_KEYS.BLOCKER_CONFIG, JSON.stringify(config));
    return config;
  } catch (error) {
    console.error('Error toggling app blocker:', error);
    throw error;
  }
}

/**
 * Toggle block on Pomodoro start
 */
export async function toggleBlockOnPomodoroStart(block: boolean): Promise<AppBlockerConfig> {
  try {
    const config = await getBlockerConfig();
    config.blockOnPomodoroStart = block;
    await AsyncStorage.setItem(APP_BLOCKER_KEYS.BLOCKER_CONFIG, JSON.stringify(config));
    return config;
  } catch (error) {
    console.error('Error toggling block on Pomodoro:', error);
    throw error;
  }
}

/**
 * Toggle blocking for a specific app
 */
export async function toggleAppBlock(appId: string, isBlocked: boolean): Promise<AppBlockerConfig> {
  try {
    const config = await getBlockerConfig();
    const app = config.blockedApps.find(a => a.id === appId);
    
    if (app) {
      app.isBlocked = isBlocked;
      app.blockedAt = isBlocked ? new Date() : undefined;
    }

    await AsyncStorage.setItem(APP_BLOCKER_KEYS.BLOCKER_CONFIG, JSON.stringify(config));
    return config;
  } catch (error) {
    console.error('Error toggling app block:', error);
    throw error;
  }
}

/**
 * Add a custom app to block
 */
export async function addCustomBlockedApp(
  packageName: string,
  name: string,
  icon?: string,
  category?: 'social' | 'games' | 'entertainment' | 'communication' | 'other'
): Promise<AppBlockerConfig> {
  try {
    const config = await getBlockerConfig();
    
    // Check if already exists
    if (config.blockedApps.some(a => a.packageName === packageName)) {
      throw new Error('App already in block list');
    }

    const newApp: BlockedApp = {
      id: `custom-${Date.now()}`,
      packageName,
      name,
      icon,
      isBlocked: true,
      category: category || 'other',
    };

    config.blockedApps.push(newApp);
    await AsyncStorage.setItem(APP_BLOCKER_KEYS.BLOCKER_CONFIG, JSON.stringify(config));
    return config;
  } catch (error) {
    console.error('Error adding custom blocked app:', error);
    throw error;
  }
}

/**
 * Remove an app from block list
 */
export async function removeBlockedApp(appId: string): Promise<AppBlockerConfig> {
  try {
    const config = await getBlockerConfig();
    config.blockedApps = config.blockedApps.filter(a => a.id !== appId);
    await AsyncStorage.setItem(APP_BLOCKER_KEYS.BLOCKER_CONFIG, JSON.stringify(config));
    return config;
  } catch (error) {
    console.error('Error removing blocked app:', error);
    throw error;
  }
}

/**
 * Get list of currently active blocked apps (during Pomodoro)
 */
export async function getActiveBlockedApps(): Promise<BlockedApp[]> {
  try {
    const config = await getBlockerConfig();
    
    if (!config.enabled || !config.blockOnPomodoroStart) {
      return [];
    }

    return config.blockedApps.filter(app => app.isBlocked);
  } catch (error) {
    console.error('Error getting active blocked apps:', error);
    return [];
  }
}

/**
 * Record app usage session
 */
export async function recordAppUsage(session: AppUsageSession): Promise<void> {
  try {
    const logs = await getAppUsageLogs();
    logs.push(session);
    
    // Keep only last 1000 sessions
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }

    await AsyncStorage.setItem(APP_BLOCKER_KEYS.APP_USAGE_LOG, JSON.stringify(logs));
  } catch (error) {
    console.error('Error recording app usage:', error);
  }
}

/**
 * Get app usage logs
 */
export async function getAppUsageLogs(): Promise<AppUsageSession[]> {
  try {
    const logs = await AsyncStorage.getItem(APP_BLOCKER_KEYS.APP_USAGE_LOG);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Error getting app usage logs:', error);
    return [];
  }
}

/**
 * Get app usage statistics for a time period
 */
export async function getAppUsageStats(
  startDate: Date,
  endDate: Date
): Promise<{
  appName: string;
  totalTime: number; // milliseconds
  sessions: number;
  wasBlocked: boolean;
}[]> {
  try {
    const logs = await getAppUsageLogs();
    
    const stats: Record<string, {
      totalTime: number;
      sessions: number;
      wasBlocked: boolean;
    }> = {};

    logs.forEach(session => {
      if (session.startTime >= startDate && session.startTime <= endDate) {
        const key = session.appPackageName;
        
        if (!stats[key]) {
          stats[key] = {
            totalTime: 0,
            sessions: 0,
            wasBlocked: session.wasBlocked,
          };
        }

        stats[key].totalTime += session.durationMs;
        stats[key].sessions += 1;
      }
    });

    return Object.entries(stats).map(([packageName, data]) => ({
      appName: packageName,
      ...data,
    }));
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return [];
  }
}

/**
 * Use emergency bypass (limited bypasses per session)
 */
export async function useEmergencyBypass(): Promise<AppBlockerConfig> {
  try {
    const config = await getBlockerConfig();
    
    if (!config.allowEmergencyBypass) {
      throw new Error('Emergency bypass not allowed');
    }

    config.emergencies += 1;
    await AsyncStorage.setItem(APP_BLOCKER_KEYS.BLOCKER_CONFIG, JSON.stringify(config));
    return config;
  } catch (error) {
    console.error('Error using emergency bypass:', error);
    throw error;
  }
}

/**
 * Reset emergency bypasses (call after Pomodoro session ends)
 */
export async function resetEmergencyBypasses(): Promise<AppBlockerConfig> {
  try {
    const config = await getBlockerConfig();
    config.emergencies = 0;
    await AsyncStorage.setItem(APP_BLOCKER_KEYS.BLOCKER_CONFIG, JSON.stringify(config));
    return config;
  } catch (error) {
    console.error('Error resetting emergency bypasses:', error);
    throw error;
  }
}
