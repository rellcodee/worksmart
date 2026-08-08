import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useTaskStore } from '../../../src/store/useTaskStore';
import { theme } from '../../../src/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';

export function WeeklyTrackerScreen() {
  const { weeklyTasks, loadAllData, addWeeklyTask, updateWeeklyTask, deleteWeeklyTask } = useTaskStore();
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    loadAllData();
    // Default the due date input to today
    const today = new Date();
    setDueDate(today.toISOString().split('T')[0]);
  }, [loadAllData]);

  const handleOpenModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const today = new Date();
    setTitle('');
    setDescription('');
    setDueDate(today.toISOString().split('T')[0]);
    setModalVisible(true);
  };

  const handleSaveTask = async () => {
    if (!title.trim() || !dueDate.trim()) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addWeeklyTask(title.trim(), description.trim(), dueDate.trim());
    setModalVisible(false);
  };

  const handleToggle = async (
    id: string,
    completed: number,
    tTitle: string,
    tDesc: string,
    tDue: string
  ) => {
    const nextVal = completed === 1 ? 0 : 1;
    if (nextVal === 1) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await updateWeeklyTask(id, tTitle, tDesc, tDue, nextVal);
  };

  const handleDelete = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await deleteWeeklyTask(id);
  };

  const formatLongDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerInfo}>
          <Text style={styles.infoTitle}>Daftar Tugas Mingguan</Text>
          <Text style={styles.infoSubtitle}>
            Setiap tugas memiliki due date terintegrasi dengan reminder dan agenda Kalender.
          </Text>
        </View>

        {weeklyTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol size={48} name="calendar" color={theme.colors.textDark} />
            <Text style={styles.emptyText}>Tidak ada tugas mingguan.</Text>
            <Text style={styles.emptySubtext}>Klik tombol + di bawah untuk menambahkan tugas.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {weeklyTasks.map((task) => (
              <View key={task.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <TouchableOpacity
                    onPress={() =>
                      handleToggle(
                        task.id,
                        task.is_completed,
                        task.title,
                        task.description,
                        task.due_date
                      )
                    }
                    style={styles.checkboxWrapper}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.checkbox,
                      task.is_completed === 1 && styles.checkboxChecked
                    ]}>
                      {task.is_completed === 1 && (
                        <View style={styles.checkboxInner} />
                      )}
                    </View>
                  </TouchableOpacity>

                  <View style={styles.cardHeaderRight}>
                    <Text style={[
                      styles.taskTitle,
                      task.is_completed === 1 && styles.taskTitleCompleted
                    ]}>
                      {task.title}
                    </Text>
                    <Text style={styles.dueDate}>
                      Jatuh Tempo: {formatLongDate(task.due_date)}
                    </Text>
                  </View>
                </View>

                {task.description ? (
                  <Text style={[
                    styles.taskDesc,
                    task.is_completed === 1 && styles.taskDescCompleted
                  ]}>
                    {task.description}
                  </Text>
                ) : null}

                <View style={styles.cardFooter}>
                  <View style={styles.badge}>
                    <IconSymbol size={10} name="bell.fill" color={theme.colors.accent} style={{ marginRight: 3 }} />
                    <Text style={styles.badgeText}>Alarm 07:00 AM</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDelete(task.id)}
                    style={styles.deleteButton}
                    activeOpacity={0.7}
                  >
                    <IconSymbol size={16} name="trash.fill" color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={handleOpenModal}
        style={styles.floatingButton}
        activeOpacity={0.8}
      >
        <IconSymbol size={24} name="plus" color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tugas Mingguan Baru</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.7}>
                <IconSymbol size={20} name="xmark" color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} keyboardShouldPersistTaps="handled">
              <View style={styles.formGroup}>
                <Text style={styles.label}>Judul Tugas</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Masukkan judul tugas..."
                  placeholderTextColor={theme.colors.textDark}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Deskripsi (Opsional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Masukkan deskripsi detail..."
                  placeholderTextColor={theme.colors.textDark}
                  value={description}
                  onChangeText={setDescription}
                  multiline={true}
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Tanggal Jatuh Tempo (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Format: YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textDark}
                  value={dueDate}
                  onChangeText={setDueDate}
                />
              </View>

              <TouchableOpacity
                onPress={handleSaveTask}
                style={styles.saveButton}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Simpan Tugas</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    paddingBottom: 100,
  },
  headerInfo: {
    marginBottom: theme.spacing.lg,
  },
  infoTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.sans,
  },
  infoSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 16,
    fontFamily: theme.fonts.sans,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: theme.spacing.xs,
  },
  emptyText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: theme.fonts.sans,
    marginTop: theme.spacing.sm,
  },
  emptySubtext: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: theme.fonts.sans,
  },
  list: {
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  checkboxWrapper: {
    paddingTop: 2,
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
  checkboxChecked: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  cardHeaderRight: {
    flex: 1,
  },
  taskTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: theme.fonts.sans,
  },
  taskTitleCompleted: {
    color: theme.colors.textDark,
    textDecorationLine: 'line-through',
  },
  dueDate: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    fontFamily: theme.fonts.mono,
  },
  taskDesc: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.sans,
  },
  taskDescCompleted: {
    color: theme.colors.textDark,
    textDecorationLine: 'line-through',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badgeText: {
    color: theme.colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 2,
  },
  floatingButton: {
    backgroundColor: theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    position: 'absolute',
    bottom: theme.spacing.lg + 50, // Tab bar margin
    right: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.sans,
  },
  modalForm: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  formGroup: {
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.fonts.sans,
  },
  textInput: {
    height: 44,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 14,
    fontFamily: theme.fonts.sans,
  },
  textArea: {
    height: 80,
    paddingTop: theme.spacing.sm,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default WeeklyTrackerScreen;
