import * as SecureStore from 'expo-secure-store';
import { StorageAdapter } from '@giderlerim/shared/services/createApiClient';

export const mobileStorage: StorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // SecureStore has a 2048 byte limit per value
      // For larger values (like kullanici JSON), we silently fail
      console.warn(`SecureStore: Failed to save key "${key}"`);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore
    }
  },

  async clear(): Promise<void> {
    const keys = ['accessToken', 'refreshToken', 'kullanici'];
    await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key).catch(() => {})));
  },
};
