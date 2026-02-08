/**
 * Native screen time integration stubs.
 *
 * Real app blocking and cross-app usage stats require native APIs and
 * platform entitlements. These functions intentionally return no-ops
 * so the app can run in Expo while keeping a clear integration surface.
 */

import { AppUsage } from './types';

export async function isNativeScreenTimeAvailable(): Promise<boolean> {
  return false;
}

export async function requestFocusShield(appNames: string[], durationMinutes?: number): Promise<boolean> {
  void appNames;
  void durationMinutes;
  return false;
}

export async function clearFocusShield(): Promise<void> {
  return;
}

export async function getExternalAppUsageSnapshot(): Promise<AppUsage[]> {
  return [];
}
