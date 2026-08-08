import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTaskStore } from '../../../src/store/useTaskStore';
import { CircularProgressBar } from '../../../src/components/Daily/CircularProgressBar';
import { DailyTaskItem } from '../../../src/components/Daily/DailyTaskItem';
import { theme } from '../../../src/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';

export function DailyTrackerScreen() {
  const { dailyTasks, loadAllData, addDailyTask, toggleDailyTask, deleteDailyTask } = useTaskStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const totalCount = dailyTasks.length;
  const completedCount = dailyTasks.filter((t) => t.is_completed === 1).length;
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await addDailyTask(newTaskTitle.trim());
    setNewTaskTitle('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Circular filled round progress bar */}
          <CircularProgressBar
            percentage={percentage}
            completedCount={completedCount}
            totalCount={totalCount}
          />

          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Rutinitas Anda</Text>
            <Text style={styles.listSubtitle}>Tugas selesai otomatis ter-reset pada pukul 00:00</Text>
          </View>

          {/* List items */}
          {dailyTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada tugas harian. Mulai buat rutinitas baru!</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {dailyTasks.map((task) => (
                <DailyTaskItem
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  isCompleted={task.is_completed}
                  onToggle={toggleDailyTask}
                  onDelete={deleteDailyTask}
                />
              ))}
            </View>
          )}
        </ScrollView>

        {/* Floating input bar at bottom */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tambah rutinitas harian..."
            placeholderTextColor={theme.colors.textDark}
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            onSubmitEditing={handleAddTask}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={handleAddTask}
            style={styles.addButton}
            activeOpacity={0.8}
          >
            <IconSymbol size={20} name="paperplane.fill" color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: 100, // input offset
  },
  listHeader: {
    marginBottom: theme.spacing.md,
  },
  listTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.sans,
  },
  listSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
    fontFamily: theme.fonts.sans,
  },
  emptyContainer: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.textDark,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: theme.fonts.sans,
  },
  listContainer: {
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontFamily: theme.fonts.sans,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DailyTrackerScreen;
