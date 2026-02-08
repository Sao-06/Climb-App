/**
 * Focus guard: track external app usage and decide when to nudge users.
 *
 * This uses AsyncStorageMock for demo purposes. Replace with
 * @react-native-async-storage/async-storage in production.
 */

import AsyncStorage from './asyncStorageMock';

export const DEFAULT_SOCIAL_APP = 'instagram';
export const SOCIAL_PENALTY_POINTS = 25;

export const APP_USAGE_LIMITS_MINUTES: Record<string, number> = {
  instagram: 10,
};

type UsageMap = Record<string, number>;

type DailyFlags = Record<string, boolean>;

const USAGE_KEY_PREFIX = '@climb:app-usage:';
const NUDGE_KEY_PREFIX = '@climb:app-nudge:';
const PENALTY_KEY_PREFIX = '@climb:app-penalty:';

const normalizeAppName = (appName: string): string => appName.trim().toLowerCase();

const getDateKey = (): string => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getUsageKey = () => `${USAGE_KEY_PREFIX}${getDateKey()}`;
const getNudgeKey = () => `${NUDGE_KEY_PREFIX}${getDateKey()}`;
const getPenaltyKey = () => `${PENALTY_KEY_PREFIX}${getDateKey()}`;

const readUsageMap = async (): Promise<UsageMap> => {
  const raw = await AsyncStorage.getItem(getUsageKey());
  return raw ? JSON.parse(raw) : {};
};

const writeUsageMap = async (map: UsageMap): Promise<void> => {
  await AsyncStorage.setItem(getUsageKey(), JSON.stringify(map));
};

const readFlags = async (key: string): Promise<DailyFlags> => {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : {};
};

const writeFlags = async (key: string, flags: DailyFlags): Promise<void> => {
  await AsyncStorage.setItem(key, JSON.stringify(flags));
};

export async function recordAppUsage(appName: string, millis: number): Promise<void> {
  if (millis <= 0) return;
  const normalized = normalizeAppName(appName);
  const usage = await readUsageMap();
  usage[normalized] = (usage[normalized] || 0) + millis;
  await writeUsageMap(usage);
}

export async function getAppUsageMinutes(appName: string): Promise<number> {
  const normalized = normalizeAppName(appName);
  const usage = await readUsageMap();
  const millis = usage[normalized] || 0;
  return Math.floor(millis / 60000);
}

export function getAppLimitMinutes(appName: string): number {
  const normalized = normalizeAppName(appName);
  return APP_USAGE_LIMITS_MINUTES[normalized] ?? 0;
}

export async function isLimitExceeded(appName: string): Promise<boolean> {
  const minutes = await getAppUsageMinutes(appName);
  const limit = getAppLimitMinutes(appName);
  if (limit <= 0) return false;
  return minutes >= limit;
}

export async function wasNudgeShown(appName: string): Promise<boolean> {
  const normalized = normalizeAppName(appName);
  const flags = await readFlags(getNudgeKey());
  return Boolean(flags[normalized]);
}

export async function markNudgeShown(appName: string): Promise<void> {
  const normalized = normalizeAppName(appName);
  const flags = await readFlags(getNudgeKey());
  flags[normalized] = true;
  await writeFlags(getNudgeKey(), flags);
}

export async function applyDailyPenaltyIfNeeded(
  appName: string,
  pointsToLose: number
): Promise<{ applied: boolean; pointsLost: number }> {
  const normalized = normalizeAppName(appName);
  const flags = await readFlags(getPenaltyKey());
  if (flags[normalized]) {
    return { applied: false, pointsLost: 0 };
  }
  flags[normalized] = true;
  await writeFlags(getPenaltyKey(), flags);
  return { applied: true, pointsLost: pointsToLose };
}
