import { create } from 'zustand';
import { getDb } from '../db/database';
import {
  scheduleEventNotification,
  cancelEventNotification,
  triggerImmediateDailyResetNotification,
} from '../services/notificationService';

export interface DailyTask {
  id: string;
  title: string;
  is_completed: number; // 0 or 1
  last_updated_date: string; // YYYY-MM-DD
}

export interface WeeklyTask {
  id: string;
  title: string;
  description: string;
  due_date: string; // YYYY-MM-DD
  is_completed: number; // 0 or 1
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  event_date: string; // YYYY-MM-DD
  description: string;
}

interface TaskState {
  dailyTasks: DailyTask[];
  weeklyTasks: WeeklyTask[];
  events: Event[];
  
  loadAllData: () => Promise<void>;
  
  // Daily tasks
  addDailyTask: (title: string) => Promise<void>;
  toggleDailyTask: (id: string) => Promise<void>;
  deleteDailyTask: (id: string) => Promise<void>;
  
  // Weekly tasks
  addWeeklyTask: (title: string, description: string, dueDate: string) => Promise<void>;
  updateWeeklyTask: (
    id: string,
    title: string,
    description: string,
    dueDate: string,
    isCompleted: number
  ) => Promise<void>;
  deleteWeeklyTask: (id: string) => Promise<void>;
  
  // Events
  addEvent: (title: string, dateStr: string, description: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

// Generate simple unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

// Get current date in Asia/Jakarta (WIB) local time YYYY-MM-DD
function getTodayStrWib(): string {
  const now = new Date();
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const wibDate = new Date(utcMs + (7 * 60 * 60 * 1000));
  const year = wibDate.getFullYear();
  const month = String(wibDate.getMonth() + 1).padStart(2, '0');
  const date = String(wibDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  dailyTasks: [],
  weeklyTasks: [],
  events: [],

  loadAllData: async () => {
    try {
      const db = await getDb();
      const todayStr = getTodayStrWib();

      // 1. Fetch raw daily tasks
      const rawDailies = await db.getAllAsync<DailyTask>('SELECT * FROM daily_tasks');
      const updatedDailies: DailyTask[] = [];
      let didReset = false;

      for (const task of rawDailies) {
        if (task.last_updated_date !== todayStr) {
          didReset = true;
          // Trigger midnight reset check: Completed tasks become incomplete
          const nextCompleted = task.is_completed === 1 ? 0 : task.is_completed;
          await db.runAsync(
            'UPDATE daily_tasks SET is_completed = ?, last_updated_date = ? WHERE id = ?',
            [nextCompleted, todayStr, task.id]
          );
          updatedDailies.push({
            ...task,
            is_completed: nextCompleted,
            last_updated_date: todayStr,
          });
        } else {
          updatedDailies.push(task);
        }
      }

      if (didReset) {
        await triggerImmediateDailyResetNotification();
      }

      // 2. Fetch weekly tasks
      const weeklies = await db.getAllAsync<WeeklyTask>(
        'SELECT * FROM weekly_tasks ORDER BY created_at DESC'
      );

      // 3. Fetch events
      const loadedEvents = await db.getAllAsync<Event>('SELECT * FROM events ORDER BY event_date ASC');

      set({
        dailyTasks: updatedDailies,
        weeklyTasks: weeklies,
        events: loadedEvents,
      });
    } catch (error) {
      console.error('Failed to load tasks and events:', error);
    }
  },

  addDailyTask: async (title) => {
    try {
      const db = await getDb();
      const id = generateId();
      const todayStr = getTodayStrWib();
      
      await db.runAsync(
        'INSERT INTO daily_tasks (id, title, is_completed, last_updated_date) VALUES (?, ?, 0, ?)',
        [id, title, todayStr]
      );
      
      set((state) => ({
        dailyTasks: [
          ...state.dailyTasks,
          { id, title, is_completed: 0, last_updated_date: todayStr },
        ],
      }));
    } catch (error) {
      console.error('Failed to add daily task:', error);
    }
  },

  toggleDailyTask: async (id) => {
    try {
      const db = await getDb();
      const todayStr = getTodayStrWib();
      const target = get().dailyTasks.find((t) => t.id === id);
      if (!target) return;

      const nextCompletedStatus = target.is_completed === 1 ? 0 : 1;
      await db.runAsync(
        'UPDATE daily_tasks SET is_completed = ?, last_updated_date = ? WHERE id = ?',
        [nextCompletedStatus, todayStr, id]
      );

      set((state) => ({
        dailyTasks: state.dailyTasks.map((t) =>
          t.id === id ? { ...t, is_completed: nextCompletedStatus, last_updated_date: todayStr } : t
        ),
      }));
    } catch (error) {
      console.error('Failed to toggle daily task:', error);
    }
  },

  deleteDailyTask: async (id) => {
    try {
      const db = await getDb();
      await db.runAsync('DELETE FROM daily_tasks WHERE id = ?', [id]);
      
      set((state) => ({
        dailyTasks: state.dailyTasks.filter((t) => t.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete daily task:', error);
    }
  },

  addWeeklyTask: async (title, description, dueDate) => {
    try {
      const db = await getDb();
      const id = generateId();
      const createdAt = new Date().toISOString();

      await db.runAsync(
        'INSERT INTO weekly_tasks (id, title, description, due_date, is_completed, created_at) VALUES (?, ?, ?, ?, 0, ?)',
        [id, title, description, dueDate, createdAt]
      );

      // Schedule alarm reminder
      await scheduleEventNotification(
        id,
        'Weekly Task Deadline!',
        dueDate,
        `Task "${title}" is due today. Don't forget to complete it!`
      );

      set((state) => ({
        weeklyTasks: [
          { id, title, description, due_date: dueDate, is_completed: 0, created_at: createdAt },
          ...state.weeklyTasks,
        ],
      }));
    } catch (error) {
      console.error('Failed to add weekly task:', error);
    }
  },

  updateWeeklyTask: async (id, title, description, dueDate, isCompleted) => {
    try {
      const db = await getDb();
      await db.runAsync(
        'UPDATE weekly_tasks SET title = ?, description = ?, due_date = ?, is_completed = ? WHERE id = ?',
        [title, description, dueDate, isCompleted, id]
      );

      if (isCompleted === 1) {
        // Cancel notification if completed
        await cancelEventNotification(id);
      } else {
        // Reschedule/Update notification if incomplete
        await scheduleEventNotification(
          id,
          'Weekly Task Deadline!',
          dueDate,
          `Task "${title}" is due today. Don't forget to complete it!`
        );
      }

      set((state) => ({
        weeklyTasks: state.weeklyTasks.map((t) =>
          t.id === id ? { ...t, title, description, due_date: dueDate, is_completed: isCompleted } : t
        ),
      }));
    } catch (error) {
      console.error('Failed to update weekly task:', error);
    }
  },

  deleteWeeklyTask: async (id) => {
    try {
      const db = await getDb();
      await db.runAsync('DELETE FROM weekly_tasks WHERE id = ?', [id]);
      
      // Cancel local reminder
      await cancelEventNotification(id);

      set((state) => ({
        weeklyTasks: state.weeklyTasks.filter((t) => t.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete weekly task:', error);
    }
  },

  addEvent: async (title, dateStr, description) => {
    try {
      const db = await getDb();
      const id = generateId();

      await db.runAsync(
        'INSERT INTO events (id, title, event_date, description) VALUES (?, ?, ?, ?)',
        [id, title, dateStr, description]
      );

      // Schedule local morning alarm
      await scheduleEventNotification(
        id,
        `Today's Agenda: ${title}`,
        dateStr,
        description || 'You have a scheduled event today!'
      );

      set((state) => ({
        events: [...state.events, { id, title, event_date: dateStr, description }].sort(
          (a, b) => a.event_date.localeCompare(b.event_date)
        ),
      }));
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  },

  deleteEvent: async (id) => {
    try {
      const db = await getDb();
      await db.runAsync('DELETE FROM events WHERE id = ?', [id]);
      
      // Cancel morning alarm
      await cancelEventNotification(id);

      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  },
}));

// Harmless comment to force IDE TS server to reload file cache

