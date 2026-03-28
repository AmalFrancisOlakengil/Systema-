import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const NotificationService = {
  async requestPermissions() {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
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
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      } as Notifications.DailyTriggerInput,
    });
  },

  async sendLevelUpNotification(rank: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Rank Up! 🎉",
        body: `You've achieved the rank of ${rank}! Keep pushing!`,
      },
      trigger: null,
    });
  }
};
