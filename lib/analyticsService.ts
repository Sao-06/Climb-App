import AsyncStorage from './asyncStorageMock';

const EVENTS_KEY = 'analytics_events';

export interface AnalyticsEvent {
  id: string;
  name: string;
  timestamp: number;
  properties?: Record<string, any>;
}

export const trackEvent = async (name: string, properties?: Record<string, any>) => {
  const ev: AnalyticsEvent = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substr(2,6)}`,
    name,
    timestamp: Date.now(),
    properties: properties || {},
  };

  try {
    const raw = await AsyncStorage.getItem(EVENTS_KEY);
    const arr: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    arr.push(ev);
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(arr));
    // lightweight console output for development
    // In production wire this to your analytics provider
    // eslint-disable-next-line no-console
    console.log('[Analytics] Event tracked:', ev.name, ev.properties || {});
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to track event', name, error);
  }
};

export const getTrackedEvents = async (): Promise<AnalyticsEvent[]> => {
  try {
    const raw = await AsyncStorage.getItem(EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
};

export const clearTrackedEvents = async () => {
  try {
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify([]));
  } catch (error) {
    // ignore
  }
};

export default { trackEvent, getTrackedEvents, clearTrackedEvents };
