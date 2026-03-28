import { DarkTheme } from '@react-navigation/native';
import { useAppStore } from './use-app-store';
import { Colors } from '../constants/theme';
import { ExpLevels } from '../types/app';

const StatColors: Record<keyof ExpLevels, string> = {
  strength: '#e11d48', // Crimson
  iq: '#2563eb',       // Deep Blue
  eq: '#9333ea',       // Purple
  dexterity: '#059669', // Emerald
  agility: '#f59e0b',   // Amber
  flexibility: '#06b6d4', // Cyan
  stamina: '#16a34a',   // Green
};

export function useDynamicTheme() {
  const { profile } = useAppStore();
  
  if (!profile) return {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      ...Colors.dark,
      primary: Colors.dark.tint,
    }
  };

  const stats = profile.exp;
  const highestStat = Object.keys(stats).reduce((a, b) => 
    stats[a as keyof ExpLevels] > stats[b as keyof ExpLevels] ? a : b
  ) as keyof ExpLevels;

  const tintColor = StatColors[highestStat] || Colors.dark.tint;

  return {
    ...DarkTheme,
    dark: true,
    colors: {
      ...DarkTheme.colors,
      primary: tintColor,
      background: Colors.dark.background,
      card: Colors.dark.background,
      text: Colors.dark.text,
      border: 'rgba(255,255,255,0.1)',
      notification: tintColor,
    },
    // Keep custom properties for components that expect them
    ...Colors.dark,
    tint: tintColor,
    tabIconSelected: tintColor,
  };
}
