import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTaskStore } from '../../store/useTaskStore';
import { theme } from '../../constants/theme';

export function CalendarSummary() {
  const { weeklyTasks, events } = useTaskStore();
  
  const now = new Date();
  // Get current date in WIB local offset
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const wibDate = new Date(utcMs + (7 * 60 * 60 * 1000));
  const year = wibDate.getFullYear();
  const month = wibDate.getMonth();
  const todayDate = wibDate.getDate();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Calculate day index for day 1 of current month
  const firstDay = new Date(year, month, 1).getDay();
  // Shift Sunday (0) to index 6, Monday (1) to index 0, etc.
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Compile active dates for markers
  const markerDates = new Set<string>();
  weeklyTasks.forEach((t) => markerDates.add(t.due_date));
  events.forEach((e) => markerDates.add(e.event_date));

  const weekdays = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];

  return (
    <View style={styles.container}>
      <Text style={styles.monthTitle}>{monthNames[month]} {year}</Text>
      
      <View style={styles.gridHeader}>
        {weekdays.map((day, idx) => (
          <Text key={idx} style={styles.headerCell}>{day}</Text>
        ))}
      </View>

      <View style={styles.gridBody}>
        {Array.from({ length: startOffset }).map((_, idx) => (
          <View key={`empty-${idx}`} style={styles.dayCell} />
        ))}

        {daysArray.map((day) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = day === todayDate;
          const hasMarker = markerDates.has(dateStr);

          return (
            <View key={`day-${day}`} style={styles.dayCell}>
              <View style={[
                styles.dayNumWrapper,
                isToday && styles.todayWrapper
              ]}>
                <Text style={[
                  styles.dayText,
                  isToday && styles.todayText
                ]}>
                  {day}
                </Text>
              </View>
              {hasMarker && <View style={styles.markerDot} />}
            </View>
          );
        })}
      </View>
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
  monthTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: theme.fonts.sans,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  headerCell: {
    color: theme.colors.textDark,
    fontSize: 11,
    fontWeight: '700',
    width: '14.28%',
    textAlign: 'center',
  },
  gridBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayNumWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayWrapper: {
    backgroundColor: theme.colors.primary,
  },
  dayText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  markerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.accent,
    position: 'absolute',
    bottom: 2,
  },
});
