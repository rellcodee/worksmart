import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { CalendarSummary } from '../../src/components/Home/CalendarSummary';
import { RecentWeeklyList } from '../../src/components/Home/RecentWeeklyList';
import { WibClock } from '../../src/components/Home/WibClock';
import { theme } from '../../src/constants/theme';
import { usePomodoroStore } from '../../src/store/usePomodoroStore';
import { useTaskStore } from '../../src/store/useTaskStore';

function DailyTrackerCard() {
  const router = useRouter();
  const { dailyTasks } = useTaskStore();

  const totalCount = dailyTasks.length;
  const completedCount = dailyTasks.filter((t) => t.is_completed === 1).length;
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/task-tracker/daily' as any);
  };

  // SVG circular bar configurations
  const size = 52;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.dailyCard}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardDailyIconBg}>
          <IconSymbol size={14} name="checkmark.circle.fill" color={theme.colors.claude} />
        </View>
        <Text style={styles.cardHeaderTitle}>Tasks</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.svgContainer}>
          <Svg width={size} height={size}>
            <Circle
              stroke={theme.colors.surface}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            <Circle
              stroke={theme.colors.claude}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <View style={styles.svgTextContainer}>
            <Text style={styles.svgPercentageText}>{Math.round(percentage)}%</Text>
          </View>
        </View>

        <View style={styles.textDetails}>
          <Text style={styles.cardMainLabel}>Daily Tracker</Text>
          <Text style={styles.cardSubLabel}>
            {totalCount > 0 ? `${completedCount}/${totalCount} done` : '0 tasks'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function PomodoroCard() {
  const router = useRouter();
  const { timeLeft, isRunning, timerMode } = usePomodoroStore();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/pomodoro' as any);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const modeLabels = {
    focus: 'Focus',
    short_break: 'Short Break',
    long_break: 'Long Break',
  };

  const statusLabel = isRunning ? 'Running' : 'Paused';

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.pomodoroCard}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardPomoIconBg}>
          <IconSymbol size={14} name="timer" color={theme.colors.text} />
        </View>
        <Text style={styles.cardHeaderTitlePomo}>{modeLabels[timerMode] || 'Focus'}</Text>
      </View>

      <View style={styles.cardBodyPomo}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{timeStr}</Text>
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const { dailyTasks, loadAllData } = useTaskStore();
  const { loadSettings } = usePomodoroStore();

  useEffect(() => {
    // Eagerly sync data from SQLite
    loadAllData();
    loadSettings();
  }, [loadAllData, loadSettings]);

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

        {/* Side-by-side interactive dashboard cards */}
        <View style={styles.cardsRow}>
          <DailyTrackerCard />
          <PomodoroCard />
        </View>

        {/* Mini Month calendar indicators */}
        <CalendarSummary />

        {/* 5 latest weekly tasks overview */}
        <RecentWeeklyList />
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
  cardsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  dailyCard: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    minHeight: 120,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#3F3F46', // subtle border (zinc-700)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pomodoroCard: {
    flex: 1,
    backgroundColor: theme.colors.claude, // Claude orange-ish semi-translucent background
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    minHeight: 120,
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: theme.colors.claude,
    shadowColor: theme.colors.claude,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  cardDailyIconBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPomoIconBg: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: theme.fonts.sans,
  },
  cardHeaderTitlePomo: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: theme.fonts.sans,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  cardBodyPomo: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
    flex: 1,
  },
  svgContainer: {
    position: 'relative',
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgPercentageText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: theme.fonts.mono,
  },
  textDetails: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    justifyContent: 'center',
  },
  cardMainLabel: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: theme.fonts.sans,
  },
  cardSubLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: theme.fonts.sans,
  },
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: theme.fonts.mono,
  },
  statusText: {
    color: theme.colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 1,
    letterSpacing: 0.5,
    fontFamily: theme.fonts.sans,
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
