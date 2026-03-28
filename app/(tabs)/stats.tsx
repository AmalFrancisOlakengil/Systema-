import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppStore } from '@/hooks/use-app-store';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StreakCalendar } from '@/components/streak-calendar';
import { useDynamicTheme } from '@/hooks/use-dynamic-theme';

export default function StatsScreen() {
  const { profile, getRank } = useAppStore();
  const router = useRouter();
  const theme = useDynamicTheme();

  if (!profile) return null;

  const rank = getRank(profile);
  const { exp } = profile;
  
  // Calculate weights (matching getRank logic)
  const mentalExp = (exp.iq + exp.eq) / 2;
  const physicalExp = (exp.strength + exp.dexterity + exp.agility + exp.flexibility + exp.stamina) / 5;
  const overallExp = (mentalExp + physicalExp) / 2;

  const stats = [
    { label: 'IQ', value: exp.iq, color: '#4A90E2' },
    { label: 'EQ', value: exp.eq, color: '#E24A90' },
    { label: 'Strength', value: exp.strength, color: '#E24A4A' },
    { label: 'Dexterity', value: exp.dexterity, color: '#E2904A' },
    { label: 'Agility', value: exp.agility, color: '#90E24A' },
    { label: 'Flexibility', value: exp.flexibility, color: '#4AE290' },
    { label: 'Stamina', value: exp.stamina, color: '#4AE2E2' },
  ];

  // Rest Day Progress
  const restDayProgress = (profile.streakCount % 7) / 7;
  const daysUntilRestDay = 7 - (profile.streakCount % 7);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Status</ThemedText>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <IconSymbol name="gear" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.nameRow}>
            <ThemedText type="subtitle">{profile.name}</ThemedText>
            <View style={[styles.rankBadge, { backgroundColor: theme.colors.primary }]}>
              <ThemedText style={styles.rankText}>{rank}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.bio}>{profile.bio}</ThemedText>
        </View>

        <StreakCalendar />

        <View style={styles.overallSection}>
          <ThemedText type="defaultSemiBold">Overall Level</ThemedText>
          <ThemedText style={styles.overallValue}>{overallExp.toFixed(1)}</ThemedText>
          <View style={styles.balanceContainer}>
             <View style={styles.balanceItem}>
                <ThemedText style={styles.balanceLabel}>Mental</ThemedText>
                <ThemedText style={styles.balanceValue}>{mentalExp.toFixed(1)}</ThemedText>
             </View>
             <View style={styles.balanceItem}>
                <ThemedText style={styles.balanceLabel}>Physical</ThemedText>
                <ThemedText style={styles.balanceValue}>{physicalExp.toFixed(1)}</ThemedText>
             </View>
          </View>
        </View>

        <View style={styles.tokenSection}>
          <View style={styles.tokenHeader}>
            <ThemedText type="defaultSemiBold">Rest Day Tokens</ThemedText>
            <View style={[styles.tokenCount, { backgroundColor: theme.colors.primary }]}>
              <ThemedText style={styles.tokenCountText}>{profile.restDayTokens}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.tokenDesc}>
            Earn a Rest Day for every 7 days of perfect streaks.
          </ThemedText>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${restDayProgress * 100}%`, backgroundColor: theme.colors.primary }
              ]} 
            />
          </View>
          <ThemedText style={styles.progressText}>
            {daysUntilRestDay === 7 ? 'New week started!' : `${daysUntilRestDay} more days until next token`}
          </ThemedText>
        </View>

        <View style={styles.statsContainer}>
          <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>Detailed Stats</ThemedText>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statRow}>
              <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
              <View style={styles.barBackground}>
                <View 
                  style={[
                    styles.barFill, 
                    { width: `${Math.min(100, stat.value)}%`, backgroundColor: stat.color }
                  ]} 
                />
              </View>
              <ThemedText style={styles.statValue}>{stat.value.toFixed(1)}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.mechanicsSection}>
          <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>System Mechanics</ThemedText>
          <View style={styles.mechanicItem}>
            <IconSymbol name="arrow.clockwise" size={16} color={theme.icon} />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.mechanicTitle}>Stat Decay</ThemedText>
              <ThemedText style={styles.mechanicDesc}>
                Missing a day without Rest Day Tokens results in a 5% decay across all stats and resets your streak.
              </ThemedText>
            </View>
          </View>
          <View style={styles.mechanicItem}>
            <IconSymbol name="circle" size={16} color={theme.icon} />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.mechanicTitle}>Rest Day Tokens</ThemedText>
              <ThemedText style={styles.mechanicDesc}>
                Automatically consumed to protect your stats and streak when you&apos;re inactive for a day.
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  profileSection: {
    marginBottom: 32,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bio: {
    opacity: 0.7,
    marginTop: 4,
  },
 overallSection: {
  backgroundColor: 'rgba(255,255,255,0.05)',
  padding: 24,
  paddingVertical: 32,
  borderRadius: 16,
  alignItems: 'center',
  marginBottom: 24,
},
 overallValue: {
  fontSize: 48,
  fontWeight: 'bold',
  marginVertical: 8,
  lineHeight: 56,
  textAlignVertical: 'center',
},
  balanceContainer: {
    flexDirection: 'row',
    gap: 40,
    marginTop: 8,
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  balanceValue: {
    fontWeight: '600',
  },
  tokenSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tokenCount: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenCountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tokenDesc: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
    opacity: 0.5,
  },
  statsContainer: {
    gap: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statLabel: {
    width: 80,
    fontSize: 14,
  },
  barBackground: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  statValue: {
    width: 40,
    fontSize: 14,
    textAlign: 'right',
  },
  mechanicsSection: {
    marginTop: 40,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  mechanicItem: {
    flexDirection: 'row',
    gap: 12,
  },
  mechanicTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  mechanicDesc: {
    fontSize: 12,
    opacity: 0.6,
    lineHeight: 18,
  },
});
