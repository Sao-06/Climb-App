import AsyncStorage from './asyncStorageMock';

const CONSENT_KEY = '@climb:tracker_focus_consent';

type ConsentState = 'granted' | 'denied' | null;

export async function getTrackerFocusConsent(): Promise<ConsentState> {
  const raw = await AsyncStorage.getItem(CONSENT_KEY);
  if (!raw) return null;
  if (raw === 'granted' || raw === 'denied') return raw;
  return null;
}

export async function setTrackerFocusConsent(state: 'granted' | 'denied'): Promise<void> {
  await AsyncStorage.setItem(CONSENT_KEY, state);
}
