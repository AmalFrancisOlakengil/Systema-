import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';
import { UserProfile, ExpLevels } from '../types/app';

const PROFILE_FILE = `${FileSystem.documentDirectory}user_profile.json`;
const API_KEY_KEY = 'gemini_api_key';

const INITIAL_EXP: ExpLevels = {
  iq: 0,
  eq: 0,
  strength: 0,
  dexterity: 0,
  agility: 0,
  flexibility: 0,
  stamina: 0,
};

export const StorageService = {
  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(PROFILE_FILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  async getProfile(): Promise<UserProfile | null> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(PROFILE_FILE);
      if (!fileInfo.exists) {
        return null;
      }
      const data = await FileSystem.readAsStringAsync(PROFILE_FILE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to get profile', e);
      return null;
    }
  },

  async setApiKey(key: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(API_KEY_KEY, key);
    } catch (e) {
      console.error('Failed to save API key', e);
    }
  },

  async getApiKey(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(API_KEY_KEY);
    } catch (e) {
      console.error('Failed to get API key', e);
      return null;
    }
  },

  async clearAll(): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(PROFILE_FILE);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(PROFILE_FILE);
      }
      await SecureStore.deleteItemAsync(API_KEY_KEY);
    } catch (e) {
      console.error('Failed to clear all storage', e);
    }
  },

  createInitialProfile(name: string, bio: string): UserProfile {
    return {
      name,
      bio,
      exp: { ...INITIAL_EXP },
      lastWorkTimestamp: null,
      dailyTasks: [],
      lastTaskRefreshDate: null,
    };
  }
};
