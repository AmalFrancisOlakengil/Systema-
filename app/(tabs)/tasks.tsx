import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppStore } from '@/hooks/use-app-store';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useDynamicTheme } from '@/hooks/use-dynamic-theme';

export default function TasksScreen() {
  const { profile, refreshDailyTasks, completeTask, rerollTask, isLoading } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rerollModalVisible, setRerollModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isGlobalReroll, setIsGlobalReroll] = useState(false);
  const [vibe, setVibe] = useState('');
  const theme = useDynamicTheme();

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

  const handleRerollPress = (id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (profile?.lastRerollDate === todayStr) {
      Alert.alert("Daily Limit Reached", "You can only reroll once per day!");
      return;
    }
    setSelectedTaskId(id);
    setIsGlobalReroll(false);
    setRerollModalVisible(true);
  };

  const handleGlobalRerollPress = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (profile?.lastRerollDate === todayStr) {
      Alert.alert("Daily Limit Reached", "You can only reroll once per day!");
      return;
    }
    setIsGlobalReroll(true);
    setSelectedTaskId(null);
    setRerollModalVisible(true);
  };

  const confirmReroll = async () => {
    if (isGlobalReroll) {
      setIsRefreshing(true);
      setRerollModalVisible(false);
      await refreshDailyTasks(vibe || 'Surprise me');
      setVibe('');
      setIsRefreshing(false);
    } else if (selectedTaskId) {
      await rerollTask(selectedTaskId, vibe || 'Surprise me');
      setRerollModalVisible(false);
      setVibe('');
      setSelectedTaskId(null);
    }
  };

  if (isLoading && !profile) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={theme.tint} />
      </ThemedView>
    );
  }

  const tasks = profile?.dailyTasks || [];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title">Daily Tasks</ThemedText>
          <ThemedText style={styles.countText}>{tasks.length}/3 Tasks</ThemedText>
        </View>
        <TouchableOpacity 
          style={[styles.globalRerollButton, { backgroundColor: theme.tint + '20' }]} 
          onPress={handleGlobalRerollPress}
        >
          <IconSymbol name="arrow.2.circlepath" size={20} color={theme.tint} />
          <ThemedText style={{ color: theme.tint, fontWeight: '600', fontSize: 14 }}>Vibe Reroll</ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.tint} />
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
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.rerollButton} 
                onPress={() => handleRerollPress(item.id)}
              >
                <IconSymbol name="arrow.2.circlepath" size={20} color={theme.icon} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.completeButton} 
                onPress={() => handleComplete(item.id)}
              >
                <IconSymbol name="circle" size={28} color={theme.tint} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal
        visible={rerollModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRerollModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <ThemedText type="subtitle">{isGlobalReroll ? 'Reroll All Tasks' : 'Reroll Task'}</ThemedText>
            <ThemedText style={styles.modalSub}>What&apos;s your current vibe?</ThemedText>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.icon }]}
              placeholder="e.g. raining, feeling lazy, at the gym..."
              placeholderTextColor={theme.icon}
              value={vibe}
              onChangeText={setVibe}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: 'rgba(0,0,0,0.05)' }]} 
                onPress={() => setRerollModalVisible(false)}
              >
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.tint }]} 
                onPress={confirmReroll}
              >
                <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Reroll</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  globalRerollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rerollButton: {
    padding: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalSub: {
    fontSize: 14,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
});
