import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarSummary } from '../../src/components/Home/CalendarSummary';
import { QuotesCarousel } from '../../src/components/Home/QuotesCarousel';
import { RecentWeeklyList } from '../../src/components/Home/RecentWeeklyList';
import { WibClock } from '../../src/components/Home/WibClock';
import { theme } from '../../src/constants/theme';
import { useTaskStore } from '../../src/store/useTaskStore';

export function HomeScreen() {
  const router = useRouter();
  const { loadAllData } = useTaskStore();

  useEffect(() => {
    // Eagerly sync data from SQLite
    loadAllData();
  }, [loadAllData]);

  const handleGoToPomodoro = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/pomodoro' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Real-time Digital WIB clock */}
        <WibClock />

        {/* Rotational motivational carousel */}
        <QuotesCarousel />

        {/* Mini Month calendar indicators */}
        <CalendarSummary />

        {/* 5 latest weekly tasks overview */}
        <RecentWeeklyList />

        {/* Quick Pomodoro launch shortcut */}
        <TouchableOpacity
          onPress={handleGoToPomodoro}
          style={styles.pomodoroButton}
          activeOpacity={0.8}
        >
          <View style={styles.pomoLeft}>
            <View style={styles.pomoIconBg}>
              <IconSymbol size={20} name="timer" color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.pomoTitle}>Focus Now</Text>
              <Text style={styles.pomoSubtitle}>Start your pomodoro session</Text>
            </View>
          </View>
          <IconSymbol size={18} name="chevron.right" color={theme.colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,

  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: 80, // tab bar padding
  },
  pomodoroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  pomoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  pomoIconBg: {
    backgroundColor: theme.colors.accent,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pomoTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: theme.fonts.sans,
  },
  pomoSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    fontFamily: theme.fonts.sans,
  },
});

export default HomeScreen;
