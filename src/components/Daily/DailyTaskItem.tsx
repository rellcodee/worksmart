import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../../constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface DailyTaskItemProps {
  id: string;
  title: string;
  isCompleted: number;
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function DailyTaskItem({ id, title, isCompleted, onToggle, onDelete }: DailyTaskItemProps) {
  
  const handleToggle = async () => {
    // Heavy physical vibration feedback when completing, light impact when unchecking
    if (isCompleted === 0) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await onToggle(id);
  };

  const handleDelete = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await onDelete(id);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleToggle}
        style={styles.checkButton}
        activeOpacity={0.7}
      >
        <View style={[
          styles.checkbox,
          isCompleted === 1 && styles.checkboxCompleted
        ]}>
          {isCompleted === 1 && (
            <View style={styles.checkInner} />
          )}
        </View>
      </TouchableOpacity>

      <Text style={[
        styles.titleText,
        isCompleted === 1 && styles.titleTextCompleted
      ]}>
        {title}
      </Text>

      <TouchableOpacity
        onPress={handleDelete}
        style={styles.deleteButton}
        activeOpacity={0.7}
      >
        <IconSymbol size={18} name="trash.fill" color={theme.colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  checkButton: {
    padding: 2,
    marginRight: theme.spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: theme.borderRadius.xs,
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
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  titleText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    fontFamily: theme.fonts.sans,
  },
  titleTextCompleted: {
    color: theme.colors.textDark,
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
});
