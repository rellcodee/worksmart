import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { initializeDatabase } from '../src/db/database';
import { useTaskStore } from '../src/store/useTaskStore';
import { useNoteStore } from '../src/store/useNoteStore';
import { usePomodoroStore } from '../src/store/usePomodoroStore';
import { theme } from '../src/constants/theme';
import { initPomodoroService } from '../src/services/pomodoroService';
import { scheduleDailyResetNotification } from '../src/services/notificationService';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function initApp() {
      try {
        // Initialize SQLite local database and run migrations
        await initializeDatabase();
        
        // Eagerly prefetch data into Zustand stores
        await Promise.all([
          useTaskStore.getState().loadAllData(),
          useNoteStore.getState().loadNotesData(),
          usePomodoroStore.getState().loadSettings(),
        ]);

        // Initialize Pomodoro Notification Service
        await initPomodoroService();

        // Initialize Daily Reset Notification Schedule
        await scheduleDailyResetNotification();
        
        setAppReady(true);
      } catch (error) {
        console.error('Error during app initialization:', error);
      }
    }
    
    initApp();
  }, []);

  if (!appReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Menyiapkan Ruang Kerja Anda...</Text>
      </View>
    );
  }

  // Bind navigation framework to dark theme only for premium aesthetic
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: theme.colors.textMuted, // fallback or safe
  },
});

// Harmless comment to force IDE TS server to reload file cache

