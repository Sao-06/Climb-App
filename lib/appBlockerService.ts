import AsyncStorage from './asyncStorageMock';
import { AppBlockerConfig, BlockedApp } from './types';
import { DEFAULT_SOCIAL_APP } from './focusGuard';

const STORAGE_KEY = '@climb:app-blocker-config';

const DEFAULT_BLOCKED_APPS: BlockedApp[] = [
  {
    id: DEFAULT_SOCIAL_APP,
    packageName: 'com.instagram.android',
    name: 'Instagram',
    category: 'social',
    icon: '📸',
    isBlocked: true,
  },
  {
    id: 'tiktok',
    packageName: 'com.zhiliaoapp.musically',
    name: 'TikTok',
    category: 'entertainment',
    icon: '🎵',
    isBlocked: true,
  },
  {
    id: 'youtube',
    packageName: 'com.google.android.youtube',
    name: 'YouTube',
    category: 'entertainment',
    icon: '▶️',
    isBlocked: false,
  },
];

const DEFAULT_CONFIG: AppBlockerConfig = {
  enabled: true,
  blockOnPomodoroStart: true,
  blockedApps: DEFAULT_BLOCKED_APPS,
};

const mergeBlockedApps = (defaults: BlockedApp[], stored: BlockedApp[]): BlockedApp[] => {
  const merged = new Map<string, BlockedApp>();

  defaults.forEach(app => merged.set(app.id, { ...app }));
  stored.forEach(app => {
    const existing = merged.get(app.id) || {};
    merged.set(app.id, { ...existing, ...app });
  });

  return Array.from(merged.values());
};

const persistConfig = async (config: AppBlockerConfig): Promise<AppBlockerConfig> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  return config;
};

const loadConfig = async (): Promise<AppBlockerConfig> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return persistConfig({ ...DEFAULT_CONFIG });
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppBlockerConfig>;
    const enabled = parsed.enabled ?? DEFAULT_CONFIG.enabled;
    const blockOnPomodoroStart = parsed.blockOnPomodoroStart ?? DEFAULT_CONFIG.blockOnPomodoroStart;
    const blockedApps = mergeBlockedApps(DEFAULT_BLOCKED_APPS, parsed.blockedApps ?? []);

    return persistConfig({ enabled, blockOnPomodoroStart, blockedApps });
  } catch (error) {
    console.warn('Failed to parse app blocker config. Resetting to defaults.', error);
    return persistConfig({ ...DEFAULT_CONFIG });
  }
};

export const getBlockerConfig = async (): Promise<AppBlockerConfig> => {
  return await loadConfig();
};

export const toggleAppBlocker = async (enabled: boolean): Promise<AppBlockerConfig> => {
  const config = await loadConfig();
  return await persistConfig({ ...config, enabled });
};

export const toggleBlockOnPomodoroStart = async (block: boolean): Promise<AppBlockerConfig> => {
  const config = await loadConfig();
  return await persistConfig({ ...config, blockOnPomodoroStart: block });
};

export const toggleAppBlock = async (appId: string, isBlocked: boolean): Promise<AppBlockerConfig> => {
  const config = await loadConfig();
  const blockedApps = config.blockedApps.map(app =>
    app.id === appId ? { ...app, isBlocked } : app
  );
  return await persistConfig({ ...config, blockedApps });
};

export const addCustomBlockedApp = async (
  packageName: string,
  name: string,
  icon: string,
  category: BlockedApp['category'] = 'other'
): Promise<AppBlockerConfig> => {
  const config = await loadConfig();
  const newApp: BlockedApp = {
    id: `custom-${Date.now()}`,
    packageName,
    name,
    category,
    icon,
    isBlocked: true,
    addedAt: new Date().toISOString(),
  };

  return await persistConfig({ ...config, blockedApps: [newApp, ...config.blockedApps] });
};

export const removeBlockedApp = async (appId: string): Promise<AppBlockerConfig> => {
  const config = await loadConfig();
  const blockedApps = config.blockedApps.filter(app => app.id !== appId);
  return await persistConfig({ ...config, blockedApps });
};

export const getActiveBlockedApps = async (): Promise<BlockedApp[]> => {
  const config = await loadConfig();
  if (!config.enabled || !config.blockOnPomodoroStart) {
    return [];
  }
  return config.blockedApps.filter(app => app.isBlocked);
};
