import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useAppStore } from '../hooks/use-app-store';
import { useDynamicTheme } from '../hooks/use-dynamic-theme';

export function StreakCalendar() {
  const { profile } = useAppStore();
  const theme = useDynamicTheme();

  if (!profile) return null;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isCompleted = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return profile.completedTaskDates.includes(dateStr);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        {now.toLocaleString('default', { month: 'long' })} {currentYear}
      </Text>
      <View style={styles.grid}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <Text key={`header-${index}`} style={[styles.headerDay, { color: theme.icon }]}>{day}</Text>
        ))}
        {days.map((day, index) => (
          <View key={index} style={styles.dayContainer}>
            {day && (
              <View style={[
                styles.dayCircle,
                isCompleted(day) && { backgroundColor: theme.tint }
              ]}>
                <Text style={[
                  styles.dayText,
                  { color: isCompleted(day) ? '#fff' : theme.text }
                ]}>
                  {day}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
      <View style={styles.statsRow}>
        <Text style={[styles.statsText, { color: theme.text }]}>Current Streak: {profile.streakCount} days</Text>
        <Text style={[styles.statsText, { color: theme.text }]}>Rest Days: {profile.restDayTokens}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1c1c1e',
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  headerDay: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 8,
  },
  dayContainer: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: '80%',
    height: '80%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
  },
  statsRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
