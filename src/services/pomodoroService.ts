import notifee, {
  AndroidCategory,
  AndroidImportance,
  EventType,
} from '@notifee/react-native';
import { Platform } from 'react-native';

// Callback handlers to coordinate with Zustand store
let storeActions = {
  pause: () => {},
  resume: () => {},
  reset: () => {},
  stopAlarm: () => {},
};

export function registerStoreActions(actions: Partial<typeof storeActions>) {
  storeActions = { ...storeActions, ...actions };
}

const ONGOING_CHANNEL_ID = 'pomodoro-ongoing-channel';
const ALARM_CHANNEL_ID = 'pomodoro-alarm-channel';

const ONGOING_NOTIFICATION_ID = 'pomodoro-timer-ongoing';
const ALARM_NOTIFICATION_ID = 'pomodoro-alarm-alert';

// Set up Background Event Handler at module root level so it runs early in headless environments
if (Platform.OS !== 'web') {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.ACTION_PRESS) {
      handleActionPress(detail.pressAction?.id);
    }
  });
}

function handleActionPress(actionId: string | undefined) {
  if (!actionId) return;

  switch (actionId) {
    case 'pause':
      storeActions.pause();
      break;
    case 'resume':
      storeActions.resume();
      break;
    case 'stop-reset':
      storeActions.reset();
      break;
    case 'stop-alarm':
      storeActions.stopAlarm();
      break;
    default:
      break;
  }
}

/**
 * Initializes Notifee notification channels and sets up listeners.
 */
export async function initPomodoroService() {
  if (Platform.OS === 'web') return;

  try {
    // Request permission (required for iOS and Android 13+)
    await notifee.requestPermission();

    // Create channel for ongoing timer
    await notifee.createChannel({
      id: ONGOING_CHANNEL_ID,
      name: 'Pomodoro Timer Status',
      importance: AndroidImportance.DEFAULT,
      vibration: false,
    });

    // Create channel for alarm pop-ups
    await notifee.createChannel({
      id: ALARM_CHANNEL_ID,
      name: 'Pomodoro Timer Alarm',
      importance: AndroidImportance.HIGH, // Heads-up banner
      sound: 'alarm', // Matches assets/audio/alarm.mp3 raw resource
      vibration: true,
      vibrationPattern: [300, 500, 300, 500],
    });

    // Set up Foreground Event Handler
    notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.ACTION_PRESS) {
        handleActionPress(detail.pressAction?.id);
      }
    });
  } catch (error) {
    console.error('Failed to initialize Pomodoro Notifee Service:', error);
  }
}

/**
 * Starts or updates the ongoing foreground service notification with timer chronometer.
 */
export async function showOngoingTimerNotification(
  mode: 'focus' | 'short_break' | 'long_break',
  targetEndTime: number,
  isRunning: boolean
) {
  if (Platform.OS === 'web') return;

  const modeLabels = {
    focus: 'Focus Session',
    short_break: 'Short Break',
    long_break: 'Long Break',
  };

  const title = modeLabels[mode];
  const body = isRunning ? 'Timer is running' : 'Timer is paused';

  // Construct actions based on running state
  const actions = isRunning
    ? [
        {
          title: 'Pause',
          pressAction: { id: 'pause' },
        },
        {
          title: 'Stop / Reset',
          pressAction: { id: 'stop-reset' },
        },
      ]
    : [
        {
          title: 'Resume',
          pressAction: { id: 'resume' },
        },
        {
          title: 'Stop / Reset',
          pressAction: { id: 'stop-reset' },
        },
      ];

  try {
    await notifee.displayNotification({
      id: ONGOING_NOTIFICATION_ID,
      title,
      body,
      android: {
        channelId: ONGOING_CHANNEL_ID,
        asForegroundService: true,
        ongoing: true, // Cannot be dismissed by swipe
        showChronometer: isRunning,
        chronometerDirection: 'down',
        timestamp: targetEndTime,
        actions,
        pressAction: {
          id: 'default',
          launchActivity: 'default', // Opens the app on notification tap
        },
      },
    });
  } catch (error) {
    console.error('Failed to display ongoing notification:', error);
  }
}

/**
 * Stops and clears the ongoing timer notification/foreground service.
 */
export async function stopOngoingNotification() {
  if (Platform.OS === 'web') return;

  try {
    await notifee.stopForegroundService();
    await notifee.cancelNotification(ONGOING_NOTIFICATION_ID);
  } catch (error) {
    console.error('Failed to stop ongoing notification:', error);
  }
}

/**
 * Displays a heads-up pop-up banner notification that loops a custom alarm sound.
 */
export async function triggerAlarmNotification(mode: 'focus' | 'short_break' | 'long_break') {
  if (Platform.OS === 'web') return;

  const modeLabels = {
    focus: 'Focus Session Finished!',
    short_break: 'Short Break Finished!',
    long_break: 'Long Break Finished!',
  };

  const title = modeLabels[mode];
  const body = mode === 'focus' ? 'Great job! Time for a break.' : 'Time to get back to work!';

  try {
    // Stop ongoing timer first
    await stopOngoingNotification();

    // Display persistent high priority alarm popup
    await notifee.displayNotification({
      id: ALARM_NOTIFICATION_ID,
      title,
      body,
      android: {
        channelId: ALARM_CHANNEL_ID,
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.HIGH, // Heads-up popup banner
        loopSound: true,
        sound: 'alarm', // Matches assets/audio/alarm.mp3
        vibrationPattern: [300, 500, 300, 500],
        actions: [
          {
            title: 'Stop Alarm',
            pressAction: { id: 'stop-alarm' },
          },
        ],
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
      },
    });
  } catch (error) {
    console.error('Failed to trigger alarm notification:', error);
  }
}

/**
 * Stops and clears the active alarm notification.
 */
export async function stopAlarmNotification() {
  if (Platform.OS === 'web') return;

  try {
    await notifee.cancelNotification(ALARM_NOTIFICATION_ID);
  } catch (error) {
    console.error('Failed to cancel alarm notification:', error);
  }
}
