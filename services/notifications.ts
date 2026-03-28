import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const NotificationService = {
  async requestPermissions() {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  },

  async scheduleDailyReminder() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    await Notifications.setNotificationCategoryAsync('task-reminder', [
      {
        identifier: 'mark-done',
        buttonTitle: 'Mark Task as Done',
        options: { opensAppToForeground: true },
      },
    ]);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Quest Awaits!",
        body: "Don't forget to complete your tasks to maintain your streak.",
        categoryIdentifier: 'task-reminder',
        android: {
          channelId: 'default',
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
      } as Notifications.DailyTriggerInput,
    });
  },

  async sendLevelUpNotification(rank: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Rank Up! 🎉",
        body: `You've achieved the rank of ${rank}! Keep pushing!`,
        android: {
          channelId: 'default',
        },
      },
      trigger: null,
    });
  },

  addListener(handler: (taskId?: string) => void) {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const actionIdentifier = response.actionIdentifier;
      if (actionIdentifier === 'mark-done') {
        handler();
      }
    });
    return subscription;
  }
};
