import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { StorageService } from '../services/storage';
import { UserProfile, ExpLevels, DailyTask } from '../types/app';
import { GeminiService } from '../services/gemini';
import { NotificationService } from '../services/notifications';

interface AppContextType {
  profile: UserProfile | null;
  apiKey: string | null;
  isLoading: boolean;
  completeOnboarding: (name: string, bio: string, key: string) => Promise<void>;
  addWork: (workDescription: string) => Promise<void>;
  refreshDailyTasks: () => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  rerollTask: (taskId: string, vibe: string) => Promise<void>;
  updateApiKey: (newKey: string) => Promise<void>;
  updateBio: (newBio: string) => Promise<void>;
  reload: () => Promise<void>;
  getRank: (profile: UserProfile) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const getRank = (profile: UserProfile) => {
  const { exp } = profile;
  const mentalExp = (exp.iq + exp.eq) / 2;
  const physicalExp = (exp.strength + exp.dexterity + exp.agility + exp.flexibility + exp.stamina) / 5;
  const overallExp = (mentalExp + physicalExp) / 2;

  if (overallExp >= 150) return 'Peak';
  if (overallExp >= 100) return 'Flow State';
  if (overallExp >= 75) return 'Mediocre';
  if (overallExp >= 50) return 'Beginner';
  if (overallExp >= 20) return 'Noob';
  return 'Trainee';
};

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
      NotificationService.requestPermissions();
      NotificationService.scheduleDailyReminder();
    }
  }, []);

  useEffect(() => {
    loadData();

    const subscription = NotificationService.addListener(() => {
      setProfile(prev => {
        if (!prev || prev.dailyTasks.length === 0) return prev;
        const firstTaskId = prev.dailyTasks[0].id;
        // We can't easily call completeTask here because it's async and depends on current profile
        // But we can trigger a reload or just let the user see the app and do it.
        // For now, let's just alert or navigate.
        return prev;
      });
    });

    return () => {
      subscription.remove();
    };
  }, [loadData]);

  const applyPenaltyIfNeeded = async (currentProfile: UserProfile) => {
    if (!currentProfile.lastWorkTimestamp) return;

    const lastWork = new Date(currentProfile.lastWorkTimestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastWork.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 1) {
      let updatedProfile = { ...currentProfile };

      if (updatedProfile.restDayTokens > 0) {
        updatedProfile.restDayTokens -= 1;
        updatedProfile.lastWorkTimestamp = now.toISOString();
      } else {
        const basePenaltyAmount = 0.05; // 5% base penalty
        const totalPenaltyFactor = Math.max(0, 1 - (basePenaltyAmount * diffDays));
        
        const updatedExp = { ...updatedProfile.exp };
        Object.keys(updatedExp).forEach((key) => {
          const k = key as keyof ExpLevels;
          updatedExp[k] = Math.max(0, updatedExp[k] * totalPenaltyFactor);
        });

        updatedProfile.exp = updatedExp;
        updatedProfile.lastWorkTimestamp = now.toISOString();
        updatedProfile.streakCount = 0;
      }

      setProfile(updatedProfile);
      await StorageService.saveProfile(updatedProfile);
    }
  };

  const updateBio = async (newBio: string) => {
    if (!profile) return;
    const updatedProfile = { ...profile, bio: newBio };
    setProfile(updatedProfile);
    await StorageService.saveProfile(updatedProfile);
  };

  const completeOnboarding = async (name: string, bio: string, key: string) => {
    const newProfile = StorageService.createInitialProfile(name, bio);
    await StorageService.saveProfile(newProfile);
    await StorageService.setApiKey(key);
    setProfile(newProfile);
    setApiKey(key);
    NotificationService.requestPermissions();
    NotificationService.scheduleDailyReminder();
  };

  const addWork = async (workDescription: string) => {
    if (!profile || !apiKey) return;

    const gemini = new GeminiService(apiKey);
    const expGains = await gemini.analyzeWork(workDescription, profile.bio);

    const oldRank = getRank(profile);
    const updatedExp = { ...profile.exp };
    Object.keys(expGains).forEach((key) => {
      const k = key as keyof ExpLevels;
      updatedExp[k] += expGains[k] || 0;
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const updatedProfile = {
      ...profile,
      exp: updatedExp,
      lastWorkTimestamp: new Date().toISOString(),
      completedTaskDates: [...new Set([...profile.completedTaskDates, todayStr])],
    };

    // Streak and Rest Day logic
    const wasAlreadyDoneToday = profile.completedTaskDates.includes(todayStr);
    if (!wasAlreadyDoneToday) {
      updatedProfile.streakCount += 1;
      if (updatedProfile.streakCount % 7 === 0) {
        updatedProfile.restDayTokens += 1;
      }
    }

    const newRank = getRank(updatedProfile);
    if (newRank !== oldRank) {
      NotificationService.sendLevelUpNotification(newRank);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setProfile(updatedProfile);
    await StorageService.saveProfile(updatedProfile);
  };

  const refreshDailyTasks = async () => {
    if (!profile || !apiKey) return;

    const todayStr = new Date().toISOString().split('T')[0];
    if (profile.lastTaskRefreshDate === todayStr && profile.dailyTasks.length >= 3) {
      return;
    }

    const gemini = new GeminiService(apiKey);
    const newTasks = await gemini.generateDailyTasks(profile.bio, profile.exp, 3);

    const updatedProfile = {
      ...profile,
      dailyTasks: newTasks,
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
    
    const oldRank = getRank(profile);
    const updatedExp = { ...profile.exp };
    updatedExp.iq += 2;

    const todayStr = new Date().toISOString().split('T')[0];
    const updatedProfile = {
      ...profile,
      dailyTasks: updatedTasks,
      exp: updatedExp,
      lastWorkTimestamp: new Date().toISOString(),
      completedTaskDates: [...new Set([...profile.completedTaskDates, todayStr])],
    };

    const wasAlreadyDoneToday = profile.completedTaskDates.includes(todayStr);
    if (!wasAlreadyDoneToday) {
      updatedProfile.streakCount += 1;
      if (updatedProfile.streakCount % 7 === 0) {
        updatedProfile.restDayTokens += 1;
      }
    }

    const newRank = getRank(updatedProfile);
    if (newRank !== oldRank) {
      NotificationService.sendLevelUpNotification(newRank);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setProfile(updatedProfile);
    await StorageService.saveProfile(updatedProfile);
  };

  const rerollTask = async (taskId: string, vibe: string) => {
    if (!profile || !apiKey) return;

    const todayStr = new Date().toISOString().split('T')[0];
    if (profile.lastRerollDate === todayStr) {
      alert("You can only reroll once per day!");
      return;
    }

    const gemini = new GeminiService(apiKey);
    const newTask = await gemini.rerollTask(profile.bio, profile.exp, vibe);

    if (newTask) {
      const updatedTasks = profile.dailyTasks.map(t => t.id === taskId ? newTask : t);
      const updatedProfile = {
        ...profile,
        dailyTasks: updatedTasks,
        lastRerollDate: todayStr,
      };
      setProfile(updatedProfile);
      await StorageService.saveProfile(updatedProfile);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
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
      rerollTask,
      updateApiKey,
      updateBio,
      reload: loadData,
      getRank,
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
