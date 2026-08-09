import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../constants/theme';
import { useTaskStore } from '../../store/useTaskStore';

export function RecentWeeklyList() {
  const { weeklyTasks, updateWeeklyTask } = useTaskStore();
  const router = useRouter();

  // Get only the 5 most recent weekly tasks
  const recentTasks = weeklyTasks.slice(0, 5);

  const handleToggle = async (id: string, completed: number, title: string, desc: string, due: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const nextCompleted = completed === 1 ? 0 : 1;
    await updateWeeklyTask(id, title, desc, due, nextCompleted);
  };

  const formatShortDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${date.getDate()} ${months[date.getMonth()]}`;
    } catch {
      return dateStr;
    }
  };

  const handleNavigate = () => {
    router.push('/(tabs)/task-tracker/weekly' as any);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleNavigate}
        style={styles.header}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>LATEST WEEKLY ASSIGNMENTS</Text>
        <IconSymbol size={16} name="chevron.right" color={theme.colors.textMuted} />
      </TouchableOpacity>

      {recentTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active weekly tasks.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {recentTasks.map((task) => (
            <View key={task.id} style={styles.itemRow}>
              <TouchableOpacity
                onPress={() => handleToggle(task.id, task.is_completed, task.title, task.description, task.due_date)}
                style={styles.checkButton}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox,
                  task.is_completed === 1 && styles.checkboxCompleted
                ]}>
                  {task.is_completed === 1 && (
                    <View style={styles.checkInner} />
                  )}
                </View>
              </TouchableOpacity>

              <Text
                style={[
                  styles.itemText,
                  task.is_completed === 1 && styles.itemTextCompleted
                ]}
                numberOfLines={1}
              >
                {task.title}
              </Text>

              <Text style={styles.dueDateText}>
                {formatShortDate(task.due_date)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    fontFamily: theme.fonts.sans,
  },
  list: {
    gap: theme.spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  checkButton: {
    marginRight: theme.spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.textDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success,
  },
  checkInner: {
    width: 8,
    height: 8,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
  },
  itemText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    fontFamily: theme.fonts.sans,
  },
  itemTextCompleted: {
    color: theme.colors.textDark,
    textDecorationLine: 'line-through',
  },
  dueDateText: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: theme.fonts.mono,
  },
  emptyContainer: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textDark,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: theme.fonts.sans,
  },
});
