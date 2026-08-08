import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants/theme';

export function WibClock() {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      // Calculate UTC time in milliseconds, then add +7 hours for WIB (Asia/Jakarta)
      const utcMs = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
      const wibDate = new Date(utcMs + (7 * 60 * 60 * 1000));

      const hours = String(wibDate.getHours()).padStart(2, '0');
      const minutes = String(wibDate.getMinutes()).padStart(2, '0');
      const seconds = String(wibDate.getSeconds()).padStart(2, '0');

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];

      setTimeStr(`${hours}:${minutes}:${seconds}`);
      setDateStr(`${days[wibDate.getDay()]}, ${wibDate.getDate()} ${months[wibDate.getMonth()]} ${wibDate.getFullYear()}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.dateText}>{dateStr}</Text>
      <Text style={styles.timeText}>{timeStr} <Text style={styles.wibLabel}>WIB</Text></Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },

  label: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: theme.fonts.sans,
  },
  timeText: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: theme.fonts.mono,
    marginVertical: 2,
  },
  wibLabel: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  dateText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    fontFamily: theme.fonts.sans,
  },
});

export default WibClock;
