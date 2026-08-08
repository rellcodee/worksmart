import { Stack } from 'expo-router';
import React from 'react';
import { theme } from '../../../src/constants/theme';

export default function TaskTrackerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 16,
          fontFamily: theme.fonts.sans,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="daily"
        options={{
          title: 'Daily Tracker',
          headerTitle: 'Rutinitas Harian',
        }}
      />
      <Stack.Screen
        name="weekly"
        options={{
          title: 'Weekly Tracker',
          headerTitle: 'Tugas Mingguan',
        }}
      />
    </Stack>
  );
}
