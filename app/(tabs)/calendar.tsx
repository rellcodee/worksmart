import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, SafeAreaView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTaskStore, Event, WeeklyTask } from '../../src/store/useTaskStore';
import { theme } from '../../src/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function CalendarScreen() {
  const { weeklyTasks, events, addEvent, deleteEvent, loadAllData } = useTaskStore();

  // Navigation state for calendar month/year
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split('T')[0] // Default to today
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Month navigation handlers
  const handlePrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Grid offsets
  const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Prepare active dates dictionary
  const activeDates = new Set<string>();
  weeklyTasks.forEach((t) => activeDates.add(t.due_date));
  events.forEach((e) => activeDates.add(e.event_date));

  // Calendar cells
  const daysGrid: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    daysGrid.push(d);
  }
  while (daysGrid.length % 7 !== 0) {
    daysGrid.push(null);
  }

  // Filter events and tasks for the selected date
  const selectedDateEvents = events.filter((e) => e.event_date === selectedDateStr);
  const selectedDateTasks = weeklyTasks.filter((t) => t.due_date === selectedDateStr);

  const handleOpenAddEvent = () => {
    setEventTitle('');
    setEventDesc('');
    setModalVisible(true);
  };

  const handleSaveEvent = () => {
    if (eventTitle.trim() === '') return;

    addEvent(eventTitle.trim(), eventDesc.trim(), selectedDateStr);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setModalVisible(false);
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const weekdays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subTitle}>AGENDA ENGINE</Text>
          <Text style={styles.title}>Kalender & Jadwal</Text>
        </View>

        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn} activeOpacity={0.7}>
            <IconSymbol size={22} name="chevron.left.forwardslash.chevron.right" color={theme.colors.text} style={styles.rotateIconLeft} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{monthNames[month]} {year}</Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn} activeOpacity={0.7}>
            <IconSymbol size={22} name="chevron.right" color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Week Headers */}
        <View style={styles.weekHeaders}>
          {weekdays.map((day, idx) => (
            <Text key={idx} style={styles.weekCell}>{day}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.grid}>
          {daysGrid.map((day, idx) => {
            if (day === null) {
              return <View key={idx} style={styles.dayCellWrapper} />;
            }

            const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = cellDateStr === selectedDateStr;
            const isToday = cellDateStr === todayStr;
            const hasActivity = activeDates.has(cellDateStr);

            return (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedDateStr(cellDateStr);
                }}
                style={styles.dayCellWrapper}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.dayNumBox,
                  isToday ? styles.todayBox : null,
                  isSelected ? styles.selectedBox : null
                ]}>
                  <Text style={[
                    styles.dayNumText,
                    isToday ? styles.todayText : null,
                    isSelected ? styles.selectedText : null
                  ]}>
                    {day}
                  </Text>
                </View>
                {hasActivity && <View style={styles.activityDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Date Header */}
        <View style={styles.itineraryHeader}>
          <Text style={styles.selectedDateLabel}>{formatDateLabel(selectedDateStr)}</Text>
          <TouchableOpacity
            onPress={handleOpenAddEvent}
            style={styles.addEventBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.addEventBtnText}>+ Tambah Event</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Date Activities Itinerary */}
        <View style={styles.itineraryList}>
          {selectedDateEvents.length === 0 && selectedDateTasks.length === 0 ? (
            <View style={styles.emptyItinerary}>
              <Text style={styles.emptyItineraryText}>Tidak ada agenda pada tanggal ini.</Text>
            </View>
          ) : (
            <>
              {/* Display Weekly Deadlines */}
              {selectedDateTasks.map((task) => (
                <View key={task.id} style={styles.itineraryCardTask}>
                  <View style={styles.itineraryCardLeft}>
                    <View style={styles.taskBadge}>
                      <Text style={styles.taskBadgeText}>DEADLINE TUGAS</Text>
                    </View>
                    <Text style={[
                      styles.activityTitle,
                      task.is_completed === 1 ? styles.completedText : null
                    ]}>
                      {task.title}
                    </Text>
                    {task.description ? (
                      <Text style={styles.activityDesc}>{task.description}</Text>
                    ) : null}
                  </View>
                  <View style={[
                    styles.statusIndicator,
                    task.is_completed === 1 ? styles.statusCompleted : styles.statusPending
                  ]}>
                    <Text style={styles.statusIndicatorText}>
                      {task.is_completed === 1 ? 'SELESAI' : 'AKTIF'}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Display Manual Events */}
              {selectedDateEvents.map((event) => (
                <View key={event.id} style={styles.itineraryCardEvent}>
                  <View style={styles.itineraryCardLeft}>
                    <View style={styles.eventBadge}>
                      <Text style={styles.eventBadgeText}>EVENT / AGENDA</Text>
                    </View>
                    <Text style={styles.activityTitle}>{event.title}</Text>
                    {event.description ? (
                      <Text style={styles.activityDesc}>{event.description}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      deleteEvent(event.id);
                    }}
                    style={styles.deleteEventButton}
                    activeOpacity={0.7}
                  >
                    <IconSymbol size={18} name="trash.fill" color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </View>

      </ScrollView>

      {/* Add Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Agenda Baru</Text>
            
            <Text style={styles.modalSubLabel}>Tanggal: {formatDateLabel(selectedDateStr)}</Text>

            <Text style={styles.inputLabel}>Judul Agenda</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Contoh: Ujian Tengah Semester, Meeting Tim..."
              placeholderTextColor={theme.colors.textDark}
              value={eventTitle}
              onChangeText={setEventTitle}
            />

            <Text style={styles.inputLabel}>Deskripsi / Detail (Opsional)</Text>
            <TextInput
              style={[styles.modalInput, styles.areaInput]}
              placeholder="Tambahkan catatan lokasi, jam, atau detail lainnya..."
              placeholderTextColor={theme.colors.textDark}
              value={eventDesc}
              onChangeText={setEventDesc}
              multiline={true}
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSaveEvent}
                style={styles.saveBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.saveBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  scrollContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl * 2,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  subTitle: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    fontFamily: theme.fonts.sans,
  },
  title: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: theme.fonts.sans,
    marginTop: 2,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  monthTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.fonts.sans,
  },
  navBtn: {
    padding: 4,
  },
  rotateIconLeft: {
    transform: [{ rotate: '180deg' }],
  },
  weekHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.sm,
  },
  weekCell: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    width: '14.2%',
    textAlign: 'center',
    fontFamily: theme.fonts.sans,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  dayCellWrapper: {
    width: '14.2%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  dayNumBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBox: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.textMuted,
  },
  selectedBox: {
    backgroundColor: theme.colors.primary,
  },
  dayNumText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '500',
    fontFamily: theme.fonts.sans,
  },
  todayText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activityDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.accent,
    position: 'absolute',
    bottom: 2,
  },
  itineraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
    paddingBottom: theme.spacing.sm,
  },
  selectedDateLabel: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: theme.fonts.sans,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  addEventBtn: {
    backgroundColor: theme.colors.primaryGlow,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addEventBtnText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: theme.fonts.sans,
  },
  itineraryList: {
    gap: theme.spacing.sm,
  },
  emptyItinerary: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  emptyItineraryText: {
    color: theme.colors.textDark,
    fontSize: 13,
    fontFamily: theme.fonts.sans,
  },
  itineraryCardTask: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itineraryCardEvent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itineraryCardLeft: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  taskBadge: {
    backgroundColor: theme.colors.accentGlow,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  taskBadgeText: {
    color: theme.colors.accent,
    fontSize: 8,
    fontWeight: '800',
    fontFamily: theme.fonts.sans,
  },
  eventBadge: {
    backgroundColor: theme.colors.primaryGlow,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  eventBadgeText: {
    color: theme.colors.primary,
    fontSize: 8,
    fontWeight: '800',
    fontFamily: theme.fonts.sans,
  },
  activityTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: theme.fonts.sans,
    marginBottom: 2,
  },
  completedText: {
    color: theme.colors.textDark,
    textDecorationLine: 'line-through',
  },
  activityDesc: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    lineHeight: 18,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusPending: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
  },
  statusIndicatorText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: theme.fonts.sans,
  },
  deleteEventButton: {
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: theme.fonts.sans,
    marginBottom: 4,
  },
  modalSubLabel: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.fonts.sans,
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.fonts.sans,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.sm,
    height: 40,
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  areaInput: {
    height: 80,
    paddingTop: 8,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.md,
  },
  cancelBtnText: {
    color: theme.colors.textMuted,
    fontWeight: '600',
    fontFamily: theme.fonts.sans,
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: theme.fonts.sans,
    fontSize: 14,
  },
});
