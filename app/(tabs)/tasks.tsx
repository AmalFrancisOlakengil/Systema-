import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppStore } from '@/hooks/use-app-store';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TasksScreen() {
  const { profile, refreshDailyTasks, completeTask, isLoading } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (profile) {
      refreshDailyTasks();
    }
  }, [profile?.lastTaskRefreshDate]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshDailyTasks();
    setIsRefreshing(false);
  };

  const handleComplete = async (id: string) => {
    await completeTask(id);
  };

  if (isLoading && !profile) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  const tasks = profile?.dailyTasks || [];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Daily Tasks</ThemedText>
        <ThemedText style={styles.countText}>{tasks.length}/3 Tasks</ThemedText>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#007AFF" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="checkmark.circle" size={64} color="#ccc" />
            <ThemedText style={styles.emptyText}>
              All caught up! Pull to refresh or wait for tomorrow.
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <View style={styles.taskInfo}>
              <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
              <ThemedText style={styles.taskDesc}>{item.description}</ThemedText>
            </View>
            <TouchableOpacity 
              style={styles.completeButton} 
              onPress={() => handleComplete(item.id)}
            >
              <IconSymbol name="circle" size={28} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  countText: {
    fontSize: 16,
    opacity: 0.6,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskDesc: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  completeButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    gap: 16,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.5,
    paddingHorizontal: 40,
  },
});
