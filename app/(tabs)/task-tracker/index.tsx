import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../src/constants/theme';
import { useTaskStore } from '../../../src/store/useTaskStore';

export function TaskTrackerHub() {
  const router = useRouter();
  const { dailyTasks, weeklyTasks, loadAllData } = useTaskStore();

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Daily stats calculation
  const totalDaily = dailyTasks.length;
  const completedDaily = dailyTasks.filter((t) => t.is_completed === 1).length;
  const dailyPercentage = totalDaily > 0 ? (completedDaily / totalDaily) * 100 : 0;

  // Weekly stats calculation
  const activeWeeklyCount = weeklyTasks.filter((t) => t.is_completed === 0).length;
  const completedWeeklyCount = weeklyTasks.filter((t) => t.is_completed === 1).length;

  const navigateToDaily = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/task-tracker/daily' as any);
  };

  const navigateToWeekly = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/task-tracker/weekly' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Task Tracker Hub</Text>
          <Text style={styles.headerSubtitle}>Manage your daily and weekly tasks</Text>
        </View>

        {/* 1. Daily Tracker Card */}
        <TouchableOpacity
          onPress={navigateToDaily}
          style={styles.card}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBg, { backgroundColor: theme.colors.accent }]}>
              <IconSymbol size={22} name="checkmark.circle.fill" color="#FFFFFF" />
            </View>
            <View style={styles.cardHeaderRight}>
              <Text style={styles.cardTitle}>Daily Tracker</Text>
              <Text style={styles.cardDesc}>Routine checklist that automatically resets daily</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statsLabel}>Today Progress</Text>
              <Text style={styles.statsValue}>
                {completedDaily} / {totalDaily} Completed ({Math.round(dailyPercentage)}%)
              </Text>
            </View>
            <IconSymbol size={20} name="chevron.right" color={theme.colors.textMuted} />
          </View>

          {/* Progress Line */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${dailyPercentage}%` }]} />
          </View>
        </TouchableOpacity>

        {/* 2. Weekly Tracker Card */}
        <TouchableOpacity
          onPress={navigateToWeekly}
          style={styles.card}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBg, { backgroundColor: theme.colors.claude }]}>
              <IconSymbol size={22} name="calendar" color="#FFFFFF" />
            </View>
            <View style={styles.cardHeaderRight}>
              <Text style={styles.cardTitle}>Weekly Tracker</Text>
              <Text style={styles.cardDesc}>Tasks with deadlines and alarm reminders</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statsLabel}>Active Tasks</Text>
              <Text style={styles.statsValue}>
                {activeWeeklyCount} Active ({completedWeeklyCount} Completed)
              </Text>
            </View>
            <IconSymbol size={20} name="chevron.right" color={theme.colors.textMuted} />
          </View>

          {/* Dummy visual weekly items preview */}
          <View style={styles.weeklySummaryRow}>
            <Text style={styles.weeklySummaryText}>
              Agenda & deadlines are integrated directly with the main Calendar
            </Text>
          </View>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.xxl,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: theme.fonts.sans,
  },
  headerSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: theme.fonts.sans,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderRight: {
    flex: 1,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.sans,
  },
  cardDesc: {
    color: theme.colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 1,
    fontFamily: theme.fonts.sans,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  statsLabel: {
    color: theme.colors.textDark,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.0,
    fontFamily: theme.fonts.sans,
  },
  statsValue: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 1,
    fontFamily: theme.fonts.mono,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  weeklySummaryRow: {
    backgroundColor: theme.colors.surfaceLight,
    paddingVertical: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  weeklySummaryText: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
    fontFamily: theme.fonts.sans,
  },
});

export default TaskTrackerHub;
