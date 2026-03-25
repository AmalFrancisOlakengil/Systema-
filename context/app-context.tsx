import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { StorageService } from '../services/storage';
import { UserProfile, ExpLevels, DailyTask } from '../types/app';
import { GeminiService } from '../services/gemini';

interface AppContextType {
  profile: UserProfile | null;
  apiKey: string | null;
  isLoading: boolean;
  completeOnboarding: (name: string, bio: string, key: string) => Promise<void>;
  addWork: (workDescription: string) => Promise<void>;
  refreshDailyTasks: () => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  updateApiKey: (newKey: string) => Promise<void>;
  reload: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const storedProfile = await StorageService.getProfile();
    const storedApiKey = await StorageService.getApiKey();
    setProfile(storedProfile);
    setApiKey(storedApiKey);
    setIsLoading(false);

    if (storedProfile) {
      applyPenaltyIfNeeded(storedProfile);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applyPenaltyIfNeeded = async (currentProfile: UserProfile) => {
    if (!currentProfile.lastWorkTimestamp) return;

    const lastWork = new Date(currentProfile.lastWorkTimestamp);
    const now = new Date();
    const diffHours = (now.getTime() - lastWork.getTime()) / (1000 * 60 * 60);

    if (diffHours >= 24) {
      const updatedExp = { ...currentProfile.exp };
      const penaltyFactor = 0.95;
      Object.keys(updatedExp).forEach((key) => {
        const k = key as keyof ExpLevels;
        updatedExp[k] = Math.max(0, updatedExp[k] * penaltyFactor);
      });

      const updatedProfile = {
        ...currentProfile,
        exp: updatedExp,
        lastWorkTimestamp: now.toISOString(),
      };
      setProfile(updatedProfile);
      await StorageService.saveProfile(updatedProfile);
    }
  };

  const completeOnboarding = async (name: string, bio: string, key: string) => {
    const newProfile = StorageService.createInitialProfile(name, bio);
    await StorageService.saveProfile(newProfile);
    await StorageService.setApiKey(key);
    setProfile(newProfile);
    setApiKey(key);
  };

  const addWork = async (workDescription: string) => {
    if (!profile || !apiKey) return;

    const gemini = new GeminiService(apiKey);
    const expGains = await gemini.analyzeWork(workDescription, profile.bio);

    const updatedExp = { ...profile.exp };
    Object.keys(expGains).forEach((key) => {
      const k = key as keyof ExpLevels;
      updatedExp[k] += expGains[k] || 0;
    });

    const updatedProfile = {
      ...profile,
      exp: updatedExp,
      lastWorkTimestamp: new Date().toISOString(),
    };

    setProfile(updatedProfile);
    await StorageService.saveProfile(updatedProfile);
  };

  const refreshDailyTasks = async () => {
    if (!profile || !apiKey) return;

    const todayStr = new Date().toISOString().split('T')[0];
    if (profile.lastTaskRefreshDate === todayStr && profile.dailyTasks.length === 3) {
      return;
    }

    const needed = 3 - profile.dailyTasks.length;
    if (needed <= 0) return;

    const gemini = new GeminiService(apiKey);
    const newTasks = await gemini.generateDailyTasks(profile.bio, profile.exp, needed);

    const updatedProfile = {
      ...profile,
      dailyTasks: [...profile.dailyTasks, ...newTasks],
      lastTaskRefreshDate: todayStr,
    };

    setProfile(updatedProfile);
    await StorageService.saveProfile(updatedProfile);
  };

  const completeTask = async (taskId: string) => {
    if (!profile) return;

    const task = profile.dailyTasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    const updatedTasks = profile.dailyTasks.filter(t => t.id !== taskId);
    
    const updatedExp = { ...profile.exp };
    updatedExp.iq += 2;

    const updatedProfile = {
      ...profile,
      dailyTasks: updatedTasks,
      exp: updatedExp,
      lastWorkTimestamp: new Date().toISOString(),
    };

    setProfile(updatedProfile);
    await StorageService.saveProfile(updatedProfile);
  };

  const updateApiKey = async (newKey: string) => {
    await StorageService.setApiKey(newKey);
    setApiKey(newKey);
  };

  return (
    <AppContext.Provider value={{
      profile,
      apiKey,
      isLoading,
      completeOnboarding,
      addWork,
      refreshDailyTasks,
      completeTask,
      updateApiKey,
      reload: loadData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStoreContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStoreContext must be used within an AppProvider');
  }
  return context;
}
