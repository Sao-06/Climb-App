import AsyncStorage from './asyncStorageMock';
import { DailyChecklist, DailyChecklistItem } from './types';

const STORAGE_KEY = '@climb:daily-checklist';

const getDateKey = (): string => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const createEmptyChecklist = (dateKey: string): DailyChecklist => ({
  dateKey,
  items: [],
  pointsEarned: 0,
  syncWithTeam: false,
});

const persist = async (checklist: DailyChecklist): Promise<DailyChecklist> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(checklist));
  return checklist;
};

export const getTodayChecklist = async (): Promise<DailyChecklist> => {
  const todayKey = getDateKey();
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return await persist(createEmptyChecklist(todayKey));
  }

  try {
    const parsed = JSON.parse(raw) as DailyChecklist;
    if (parsed.dateKey !== todayKey) {
      return await persist(createEmptyChecklist(todayKey));
    }
    return parsed;
  } catch (error) {
    console.warn('Resetting corrupted daily checklist', error);
    return await persist(createEmptyChecklist(todayKey));
  }
};

export const addChecklistItem = async (
  title: string,
  description: string | undefined,
  points: number
): Promise<DailyChecklist> => {
  const checklist = await getTodayChecklist();
  const newItem: DailyChecklistItem = {
    id: `chk-${Date.now()}`,
    title: title.trim(),
    description: description?.trim() || undefined,
    points: Math.max(1, Math.round(points)),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  return await persist({ ...checklist, items: [newItem, ...checklist.items] });
};

export const toggleChecklistItem = async (
  itemId: string
): Promise<{ checklist: DailyChecklist; pointsDelta: number }> => {
  const checklist = await getTodayChecklist();
  let delta = 0;

  const updatedItems = checklist.items.map(item => {
    if (item.id === itemId) {
      const nextCompleted = !item.completed;
      delta = nextCompleted ? item.points : -item.points;
      return { ...item, completed: nextCompleted };
    }
    return item;
  });

  const updatedChecklist: DailyChecklist = {
    ...checklist,
    items: updatedItems,
    pointsEarned: Math.max(0, checklist.pointsEarned + Math.max(0, delta)),
  };

  return { checklist: await persist(updatedChecklist), pointsDelta: delta };
};

export const resetTodayChecklist = async (): Promise<DailyChecklist> => {
  const todayKey = getDateKey();
  return await persist(createEmptyChecklist(todayKey));
};

export const setChecklistSyncPreference = async (syncWithTeam: boolean): Promise<DailyChecklist> => {
  const checklist = await getTodayChecklist();
  return await persist({ ...checklist, syncWithTeam });
};
