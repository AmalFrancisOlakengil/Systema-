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
  
  if (!profile) return Colors.dark;

  const stats = profile.exp;
  const highestStat = Object.keys(stats).reduce((a, b) => 
    stats[a as keyof ExpLevels] > stats[b as keyof ExpLevels] ? a : b
  ) as keyof ExpLevels;

  const tintColor = StatColors[highestStat] || Colors.dark.tint;

  return {
    ...Colors.dark,
    tint: tintColor,
    tabIconSelected: tintColor,
  };
}
