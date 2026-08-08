import { create } from 'zustand';
import { Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { getDb } from '../db/database';

export type TimerMode = 'focus' | 'short_break' | 'long_break';

interface PomodoroState {
  focusTime: number; // in minutes
  shortBreak: number; // in minutes
  longBreak: number; // in minutes
  timerMode: TimerMode;
  timeLeft: number; // in seconds
  isRunning: boolean;
  endTime: number | null; // target timestamp (ms)

  loadSettings: () => Promise<void>;
  updateSettings: (focus: number, short: number, long: number) => Promise<void>;
  setTimerMode: (mode: TimerMode) => void;
  startTimer: (onComplete?: () => void) => Promise<void>;
  pauseTimer: () => Promise<void>;
  resetTimer: () => Promise<void>;
  tick: (onComplete?: () => void) => void;
  checkBackgroundTime: (onComplete?: () => void) => void;
}

let timerInterval: any = null;
const POMODORO_NOTIF_ID = 'pomodoro-timer-alert';

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  focusTime: 25,
  shortBreak: 5,
  longBreak: 15,
  timerMode: 'focus',
  timeLeft: 25 * 60,
  isRunning: false,
  endTime: null,

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

      set({
        focusTime: focus,
        shortBreak: short,
        longBreak: long,
        timeLeft: nextSeconds,
        isRunning: false,
        endTime: null,
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

    set({
      timerMode: mode,
      timeLeft: seconds,
      isRunning: false,
      endTime: null,
    });
  },

  startTimer: async (onComplete) => {
    const { isRunning, timeLeft, timerMode } = get();
    if (isRunning) return;

    // Trigger slight haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const targetEndTime = Date.now() + timeLeft * 1000;
    set({ isRunning: true, endTime: targetEndTime });

    // Schedule background notification
    const notificationTitle =
      timerMode === 'focus'
        ? 'Sesi Fokus Selesai!'
        : timerMode === 'short_break'
        ? 'Istirahat Singkat Selesai!'
        : 'Istirahat Panjang Selesai!';
    
    const notificationBody =
      timerMode === 'focus'
        ? 'Bagus sekali! Waktunya istirahat sejenak.'
        : 'Waktunya kembali fokus bekerja!';

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
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    await Notifications.cancelScheduledNotificationAsync(POMODORO_NOTIF_ID);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    set({ isRunning: false, endTime: null });
  },

  resetTimer: async () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    await Notifications.cancelScheduledNotificationAsync(POMODORO_NOTIF_ID);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { timerMode, focusTime, shortBreak, longBreak } = get();
    let seconds = focusTime * 60;
    if (timerMode === 'short_break') seconds = shortBreak * 60;
    if (timerMode === 'long_break') seconds = longBreak * 60;

    set({ timeLeft: seconds, isRunning: false, endTime: null });
  },

  tick: (onComplete) => {
    const { timeLeft } = get();
    if (timeLeft <= 1) {
      // Completed!
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      
      // Perform completion alarms
      Vibration.vibrate([0, 500, 200, 500]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      set({ timeLeft: 0, isRunning: false, endTime: null });
      if (onComplete) onComplete();
    } else {
      set({ timeLeft: timeLeft - 1 });
    }
  },

  checkBackgroundTime: (onComplete) => {
    const { isRunning, endTime } = get();
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

      set({ timeLeft: 0, isRunning: false, endTime: null });
      if (onComplete) onComplete();
    } else {
      set({ timeLeft: remainingSeconds });
      // Restart ticker
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        get().tick(onComplete);
      }, 1000);
    }
  },
}));
export default usePomodoroStore;
