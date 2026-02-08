/**
 * Native screen time integration bridge.
 *
 * Real app blocking and cross-app usage stats require native APIs and
 * platform entitlements. These functions safely no-op in Expo Go, while
 * delegating to a native module in custom dev builds.
 */

import { Linking, NativeModules, Platform } from 'react-native';
import { AppUsage } from './types';

type PermissionStatus = {
  granted: boolean;
  missing?: string[];
};

type FocusShieldRequest = {
  packages: string[];
  appNames?: string[];
  durationMinutes?: number;
  hardRedirect?: boolean;
};

type FocusShieldModule = {
  isAvailable: () => Promise<boolean>;
  requestPermissions: () => Promise<PermissionStatus>;
  getUsageSnapshot: () => Promise<AppUsage[]>;
  startShield: (request: FocusShieldRequest) => Promise<boolean>;
  stopShield: () => Promise<void>;
  openSettings?: () => Promise<void>;
  startBreakEnforcement?: (request: { packages: string[]; dailyLimitMinutes: number }) => Promise<void>;
};

const focusShield = NativeModules.FocusShield as FocusShieldModule | undefined;

export async function isNativeScreenTimeAvailable(): Promise<boolean> {
  if (!focusShield?.isAvailable) return false;
  return await focusShield.isAvailable();
}

export async function requestScreenTimePermissions(): Promise<PermissionStatus> {
  if (!focusShield?.requestPermissions) {
    return { granted: false, missing: ['native_module'] };
  }
  return await focusShield.requestPermissions();
}

export async function openScreenTimeSettings(): Promise<void> {
  if (focusShield?.openSettings) {
    await focusShield.openSettings();
    return;
  }
  if (Platform.OS !== 'web') {
    await Linking.openSettings();
  }
}

export async function requestFocusShield(
  packages: string[],
  durationMinutes?: number,
  hardRedirect: boolean = true,
  appNames?: string[]
): Promise<boolean> {
  if (!focusShield?.startShield) {
    return false;
  }
  return await focusShield.startShield({
    packages,
    appNames,
    durationMinutes,
    hardRedirect
  });
}

export async function clearFocusShield(): Promise<void> {
  if (!focusShield?.stopShield) return;
  await focusShield.stopShield();
}

export async function getExternalAppUsageSnapshot(): Promise<AppUsage[]> {
  if (!focusShield?.getUsageSnapshot) return [];
  return await focusShield.getUsageSnapshot();
}

export async function startBreakEnforcement(
  packages: string[],
  dailyLimitMinutes: number
): Promise<void> {
  if (!focusShield?.startBreakEnforcement) return;
  await focusShield.startBreakEnforcement({ packages, dailyLimitMinutes });
}
