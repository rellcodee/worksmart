import { create } from 'zustand';
import { Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { getDb } from '../db/database';
import {
  showOngoingTimerNotification,
  stopOngoingNotification,
  triggerAlarmNotification,
  stopAlarmNotification,
  registerStoreActions,
} from '../services/pomodoroService';

export type TimerMode = 'focus' | 'short_break' | 'long_break';

interface PomodoroState {
  focusTime: number; // in minutes
  shortBreak: number; // in minutes
  longBreak: number; // in minutes
  timerMode: TimerMode;
  timeLeft: number; // in seconds
  isRunning: boolean;
  endTime: number | null; // target timestamp (ms)
  isAlarmActive: boolean;

  loadSettings: () => Promise<void>;
  updateSettings: (focus: number, short: number, long: number) => Promise<void>;
  setTimerMode: (mode: TimerMode) => void;
  startTimer: (onComplete?: () => void) => Promise<void>;
  pauseTimer: () => Promise<void>;
  resetTimer: () => Promise<void>;
  tick: (onComplete?: () => void) => void;
  checkBackgroundTime: (onComplete?: () => void) => void;
  stopAlarm: () => Promise<void>;
}

let timerInterval: any = null;
const POMODORO_NOTIF_ID = 'pomodoro-timer-alert';
let soundObject: Audio.Sound | null = null;

async function playAlarmSound() {
  try {
    if (soundObject) {
      await soundObject.stopAsync();
      await soundObject.unloadAsync();
      soundObject = null;
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playThroughEarpieceAndroid: false,
    });

    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/audio/alarm.mp3'),
      { shouldPlay: true, isLooping: true }
    );
    soundObject = sound;
  } catch (error) {
    console.error('Failed to play alarm sound:', error);
  }
}

async function stopAlarmSound() {
  try {
    if (soundObject) {
      await soundObject.stopAsync();
      await soundObject.unloadAsync();
      soundObject = null;
    }
  } catch (error) {
    console.error('Failed to stop alarm sound:', error);
  }
}

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  focusTime: 25,
  shortBreak: 5,
  longBreak: 15,
  timerMode: 'focus',
  timeLeft: 25 * 60,
  isRunning: false,
  endTime: null,
  isAlarmActive: false,

  loadSettings: async () => {
    try {
      const db = await getDb();
      const settings = await db.getFirstAsync<{
        focus_time: number;
        short_break: number;
        long_break: number;
      }>('SELECT focus_time, short_break, long_break FROM pomodoro_settings WHERE id = 1');

      if (settings) {
        const { focus_time, short_break, long_break } = settings;
        const currentMode = get().timerMode;
        
        let initialSeconds = focus_time * 60;
        if (currentMode === 'short_break') initialSeconds = short_break * 60;
        if (currentMode === 'long_break') initialSeconds = long_break * 60;

        set({
          focusTime: focus_time,
          shortBreak: short_break,
          longBreak: long_break,
          timeLeft: initialSeconds,
        });
      }
    } catch (error) {
      console.error('Failed to load pomodoro settings:', error);
    }
  },

  updateSettings: async (focus, short, long) => {
    try {
      const db = await getDb();
      await db.runAsync(
        'UPDATE pomodoro_settings SET focus_time = ?, short_break = ?, long_break = ? WHERE id = 1',
        [focus, short, long]
      );

      const currentMode = get().timerMode;
      let nextSeconds = focus * 60;
      if (currentMode === 'short_break') nextSeconds = short * 60;
      if (currentMode === 'long_break') nextSeconds = long * 60;

      // Stop running timer on settings change
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      await Notifications.cancelScheduledNotificationAsync(POMODORO_NOTIF_ID);
      await stopOngoingNotification();
      await stopAlarmNotification();
      await stopAlarmSound();

      set({
        focusTime: focus,
        shortBreak: short,
        longBreak: long,
        timeLeft: nextSeconds,
        isRunning: false,
        endTime: null,
        isAlarmActive: false,
      });
    } catch (error) {
      console.error('Failed to update pomodoro settings:', error);
    }
  },

  setTimerMode: (mode) => {
    const { focusTime, shortBreak, longBreak } = get();
    let seconds = focusTime * 60;
    if (mode === 'short_break') seconds = shortBreak * 60;
    if (mode === 'long_break') seconds = longBreak * 60;

    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    Notifications.cancelScheduledNotificationAsync(POMODORO_NOTIF_ID);
    stopOngoingNotification();
    stopAlarmNotification();
    stopAlarmSound();

    set({
      timerMode: mode,
      timeLeft: seconds,
      isRunning: false,
      endTime: null,
      isAlarmActive: false,
    });
  },

  startTimer: async (onComplete) => {
    const { isRunning, timeLeft, timerMode, isAlarmActive } = get();
    if (isRunning) return;

    // If alarm is ringing, stop it
    if (isAlarmActive) {
      await stopAlarmSound();
      await stopAlarmNotification();
    }

    // Trigger slight haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const targetEndTime = Date.now() + timeLeft * 1000;
    set({ isRunning: true, endTime: targetEndTime, isAlarmActive: false });

    // Show Notifee ongoing notification
    await showOngoingTimerNotification(timerMode, targetEndTime, true);

    // Schedule background notification for OS level backup
    const notificationTitle =
      timerMode === 'focus'
        ? 'Focus Session Finished!'
        : timerMode === 'short_break'
        ? 'Short Break Finished!'
        : 'Long Break Finished!';
    
    const notificationBody =
      timerMode === 'focus'
        ? 'Great job! Time for a short break.'
        : 'Time to get back to work!';

    await Notifications.scheduleNotificationAsync({
      identifier: POMODORO_NOTIF_ID,
      content: {
        title: notificationTitle,
        body: notificationBody,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(targetEndTime),
      },
    });

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      get().tick(onComplete);
    }, 1000);
  },

  pauseTimer: async () => {
    const { timerMode, timeLeft } = get();
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    await Notifications.cancelScheduledNotificationAsync(POMODORO_NOTIF_ID);
    await showOngoingTimerNotification(timerMode, Date.now() + timeLeft * 1000, false);
    await stopAlarmSound();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    set({ isRunning: false, endTime: null, isAlarmActive: false });
  },

  resetTimer: async () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    await Notifications.cancelScheduledNotificationAsync(POMODORO_NOTIF_ID);
    await stopOngoingNotification();
    await stopAlarmNotification();
    await stopAlarmSound();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { timerMode, focusTime, shortBreak, longBreak } = get();
    let seconds = focusTime * 60;
    if (timerMode === 'short_break') seconds = shortBreak * 60;
    if (timerMode === 'long_break') seconds = longBreak * 60;

    set({ timeLeft: seconds, isRunning: false, endTime: null, isAlarmActive: false });
  },

  tick: async (onComplete) => {
    const { timeLeft, timerMode } = get();
    if (timeLeft <= 1) {
      // Completed!
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      
      // Perform completion alarms
      Vibration.vibrate([0, 500, 200, 500]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      playAlarmSound();
      await triggerAlarmNotification(timerMode);

      set({ timeLeft: 0, isRunning: false, endTime: null, isAlarmActive: true });
      if (onComplete) onComplete();
    } else {
      set({ timeLeft: timeLeft - 1 });
    }
  },

  checkBackgroundTime: async (onComplete) => {
    const { isRunning, endTime, timerMode } = get();
    if (!isRunning || !endTime) return;

    const diff = endTime - Date.now();
    const remainingSeconds = Math.round(diff / 1000);

    if (remainingSeconds <= 0) {
      // Completed in background
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      
      Vibration.vibrate([0, 500, 200, 500]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      playAlarmSound();
      await triggerAlarmNotification(timerMode);

      set({ timeLeft: 0, isRunning: false, endTime: null, isAlarmActive: true });
      if (onComplete) onComplete();
    } else {
      set({ timeLeft: remainingSeconds });
      // Update ongoing notification
      await showOngoingTimerNotification(timerMode, endTime, true);
      // Restart ticker
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        get().tick(onComplete);
      }, 1000);
    }
  },

  stopAlarm: async () => {
    await stopAlarmSound();
    await stopAlarmNotification();
    set({ isAlarmActive: false });
  },
}));

// Register actions to let Pomodoro Service control the store
registerStoreActions({
  pause: () => usePomodoroStore.getState().pauseTimer(),
  resume: () => usePomodoroStore.getState().startTimer(),
  reset: () => usePomodoroStore.getState().resetTimer(),
  stopAlarm: () => usePomodoroStore.getState().stopAlarm(),
});

export default usePomodoroStore;
