/**
 * AsyncStorage Mock Implementation
 * Provides a simple in-memory storage for development/testing
 * Can be replaced with @react-native-async-storage/async-storage in production
 */

const storage: Record<string, string> = {};

const AsyncStorageMock = {
  setItem: async (key: string, value: string): Promise<void> => {
    storage[key] = value;
  },

  getItem: async (key: string): Promise<string | null> => {
    return storage[key] || null;
  },

  removeItem: async (key: string): Promise<void> => {
    delete storage[key];
  },

  clear: async (): Promise<void> => {
    Object.keys(storage).forEach(key => delete storage[key]);
  },

  getAllKeys: async (): Promise<string[]> => {
    return Object.keys(storage);
  },

  multiSet: async (keyValuePairs: [string, string][]): Promise<void> => {
    keyValuePairs.forEach(([key, value]) => {
      storage[key] = value;
    });
  },

  multiGet: async (keys: string[]): Promise<[string, string | null][]> => {
    return keys.map(key => [key, storage[key] || null]);
  },

  multiRemove: async (keys: string[]): Promise<void> => {
    keys.forEach(key => delete storage[key]);
  },
};

export default AsyncStorageMock;
