import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set up the foreground notification handler
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Requests permissions for displaying notifications on the device.
 * Returns true if permissions were granted, false otherwise.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Schedules a local notification at exactly 07:00 AM on the day of the event/deadline.
 * If the computed 07:00 AM timestamp has already passed, it will not schedule.
 * 
 * @param id Unique identifier (e.g. event_id or weekly_task_id) so we can cancel it later
 * @param title The notification title
 * @param dateStr ISO format string "YYYY-MM-DD"
 * @param body The notification body message
 */
export async function scheduleEventNotification(
  id: string,
  title: string,
  dateStr: string,
  body: string
): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    // Request permission if not already granted
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    // Create 07:00 AM local time date object
    const targetDate = new Date(`${dateStr}T07:00:00`);

    // Check if the scheduled time is in the past
    if (targetDate.getTime() <= Date.now()) {
      return null;
    }

    // Cancel any previous scheduled notification with the same ID
    await cancelEventNotification(id);

    // Configure channel for Android custom sound
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default-event-channel', {
        name: 'Event Reminders',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'notif.mp3',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#d46617',
      });
    }

    // Schedule notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title: title,
        body: body,
        sound: 'notif.mp3', // Custom sound for iOS
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: targetDate,
        channelId: 'default-event-channel', // Target custom channel for Android
      },
    });

    return notificationId;
  } catch (error) {
    console.error(`Failed to schedule notification for ${id}:`, error);
    return null;
  }
}

/**
 * Cancels a scheduled local notification by its unique identifier.
 */
export async function cancelEventNotification(id: string): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.error(`Failed to cancel notification for ${id}:`, error);
  }
}


/**
 * Schedules a daily recurring notification at exactly 00:00 AM local time
 * notifying the user that their daily tasks have been reset for the new day.
 */
export async function scheduleDailyResetNotification(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    // Cancel any existing daily reset notification first
    await cancelEventNotification('daily-reset-recurring');

    // Configure channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-reset-channel', {
        name: 'Daily Reset Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'notif.mp3',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#d46617',
      });
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: 'daily-reset-recurring',
      content: {
        title: 'Daily Tasks Reset',
        body: 'A new day has started! Your daily tasks have been reset for a fresh start.',
        sound: 'notif.mp3',
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 0,
        minute: 0,
        repeats: true,
        channelId: 'daily-reset-channel',
      } as any,
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule daily reset notification:', error);
    return null;
  }
}

/**
 * Triggers an immediate local notification telling the user their tasks were reset.
 */
export async function triggerImmediateDailyResetNotification(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    // Configure channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-reset-channel', {
        name: 'Daily Reset Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'notif.mp3',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#d46617',
      });
    }

    await Notifications.scheduleNotificationAsync({
      identifier: 'daily-reset-immediate',
      content: {
        title: 'Daily Tasks Reset',
        body: 'Your daily tasks have been reset because it is a new day!',
        sound: 'notif.mp3',
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error('Failed to trigger immediate daily reset notification:', error);
  }
}

export default {
  requestNotificationPermissions,
  scheduleEventNotification,
  cancelEventNotification,
  scheduleDailyResetNotification,
  triggerImmediateDailyResetNotification,
};


