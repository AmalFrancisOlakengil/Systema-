import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppStore } from '@/hooks/use-app-store';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function StatsScreen() {
  const { profile } = useAppStore();
  const router = useRouter();

  if (!profile) return null;

  const { exp } = profile;
  
  // Calculate weights
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

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Status</ThemedText>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <IconSymbol name="gear" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <ThemedText type="subtitle">{profile.name}</ThemedText>
          <ThemedText style={styles.bio}>{profile.bio}</ThemedText>
        </View>

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

        <View style={styles.statsContainer}>
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
  bio: {
    opacity: 0.7,
    marginTop: 4,
  },
 overallSection: {
  backgroundColor: 'rgba(0,0,0,0.05)',
  padding: 24,
  paddingVertical: 32, // Increase vertical padding
  borderRadius: 16,
  alignItems: 'center',
  marginBottom: 32,
},
 overallValue: {
  fontSize: 48,
  fontWeight: 'bold',
  marginVertical: 8,
  lineHeight: 56, // Add this: should be ~15-20% larger than fontSize
  textAlignVertical: 'center', // Helps on Android
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
    backgroundColor: 'rgba(0,0,0,0.1)',
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
});
