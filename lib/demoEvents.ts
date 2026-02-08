/**
 * Simple in-app demo event bus for hackathon simulations.
 */

type DemoUsageListener = (payload: { appName: string; minutes: number; source?: string }) => void;

const usageListeners = new Set<DemoUsageListener>();

export function subscribeDemoUsage(listener: DemoUsageListener): () => void {
  usageListeners.add(listener);
  return () => usageListeners.delete(listener);
}

export function emitDemoUsage(appName: string, minutes: number, source?: string): void {
  usageListeners.forEach(listener => listener({ appName, minutes, source }));
}
