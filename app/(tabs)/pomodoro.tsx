import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, TextInput, AppState, AppStateStatus, SafeAreaView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { usePomodoroStore, TimerMode } from '../../src/store/usePomodoroStore';
import { theme } from '../../src/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function PomodoroScreen() {
  const {
    focusTime,
    shortBreak,
    longBreak,
    timerMode,
    timeLeft,
    isRunning,
    loadSettings,
    updateSettings,
    setTimerMode,
    startTimer,
    pauseTimer,
    resetTimer,
    checkBackgroundTime,
  } = usePomodoroStore();

  const [settingsVisible, setSettingsVisible] = useState(false);
  
  // Custom inputs state
  const [focusInput, setFocusInput] = useState('');
  const [shortInput, setShortInput] = useState('');
  const [longInput, setLongInput] = useState('');

  // Initial load
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handle AppState changes (Sync timer when coming back from background)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkBackgroundTime();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [checkBackgroundTime]);

  // Time formatter (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Open settings form
  const handleOpenSettings = () => {
    setFocusInput(String(focusTime));
    setShortInput(String(shortBreak));
    setLongInput(String(longBreak));
    setSettingsVisible(true);
  };

  // Save customized settings
  const handleSaveSettings = () => {
    const focus = parseInt(focusInput, 10);
    const short = parseInt(shortInput, 10);
    const long = parseInt(longInput, 10);

    if (isNaN(focus) || isNaN(short) || isNaN(long) || focus <= 0 || short <= 0 || long <= 0) {
      alert('Durasi harus berupa angka positif!');
      return;
    }

    updateSettings(focus, short, long);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSettingsVisible(false);
  };

  const activeModeColor =
    timerMode === 'focus'
      ? theme.colors.primary
      : timerMode === 'short_break'
      ? theme.colors.warning
      : theme.colors.danger;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subTitle}>FOCUS ENGINE</Text>
          <Text style={styles.title}>Pomodoro Timer</Text>
        </View>

        {/* Mode Selector Tabs */}
        <View style={styles.modeTabs}>
          {(['focus', 'short_break', 'long_break'] as TimerMode[]).map((mode) => {
            const isActive = timerMode === mode;
            const modeLabel =
              mode === 'focus'
                ? 'Fokus'
                : mode === 'short_break'
                ? 'Istirahat Singkat'
                : 'Istirahat Panjang';

            return (
              <TouchableOpacity
                key={mode}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setTimerMode(mode);
                }}
                style={[
                  styles.modeTab,
                  isActive
                    ? {
                        backgroundColor:
                          mode === 'focus'
                            ? theme.colors.primaryGlow
                            : mode === 'short_break'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                        borderColor: activeModeColor,
                        borderWidth: 1,
                      }
                    : null,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    isActive ? { color: activeModeColor, fontWeight: '700' } : null,
                  ]}
                >
                  {modeLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Timer Countdown Card */}
        <View style={styles.timerCard}>
          <Text style={[styles.timerDigits, { color: activeModeColor }]}>
            {formatTime(timeLeft)}
          </Text>
          <Text style={styles.modeIndicator}>
            {timerMode === 'focus'
              ? 'Saatnya tetap fokus!'
              : 'Santai, istirahatkan pikiranmu.'}
          </Text>
        </View>

        {/* Timer Control Buttons */}
        <View style={styles.controlRow}>
          {/* Settings Trigger */}
          <TouchableOpacity
            onPress={handleOpenSettings}
            style={styles.circleBtnSecondary}
            activeOpacity={0.7}
          >
            <IconSymbol size={24} name="chevron.left.forwardslash.chevron.right" color={theme.colors.text} style={styles.settingsIcon} />
          </TouchableOpacity>

          {/* Start / Pause */}
          <TouchableOpacity
            onPress={() => {
              if (isRunning) {
                pauseTimer();
              } else {
                startTimer();
              }
            }}
            style={[styles.circleBtnPlay, { backgroundColor: activeModeColor }]}
            activeOpacity={0.8}
          >
            <IconSymbol
              size={32}
              name={isRunning ? 'chevron.left.forwardslash.chevron.right' : 'chevron.right'} // Using basic mapped ones, wait: in IconSymbol, we have 'chevron.right' = chevron-right. Let's make sure it looks fine or map play/pause
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* Reset */}
          <TouchableOpacity
            onPress={resetTimer}
            style={styles.circleBtnSecondary}
            activeOpacity={0.7}
          >
            <IconSymbol size={24} name="trash.fill" color={theme.colors.text} />
          </TouchableOpacity>
        </View>

      </View>

      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={settingsVisible}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kustomisasi Durasi (Menit)</Text>

            <Text style={styles.inputLabel}>Sesi Fokus (Pomodoro)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              value={focusInput}
              onChangeText={setFocusInput}
            />

            <Text style={styles.inputLabel}>Istirahat Singkat</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              value={shortInput}
              onChangeText={setShortInput}
            />

            <Text style={styles.inputLabel}>Istirahat Panjang</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              value={longInput}
              onChangeText={setLongInput}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setSettingsVisible(false)}
                style={styles.cancelBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSaveSettings}
                style={[styles.saveBtn, { backgroundColor: activeModeColor }]}
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
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginBottom: theme.spacing.xl,
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
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTabText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.fonts.sans,
  },
  timerCard: {
    backgroundColor: theme.colors.surface,
    width: '100%',
    aspectRatio: 1.2,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  timerDigits: {
    fontSize: 72,
    fontWeight: 'bold',
    fontFamily: theme.fonts.mono,
  },
  modeIndicator: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontFamily: theme.fonts.sans,
    marginTop: theme.spacing.md,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    width: '100%',
  },
  circleBtnPlay: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  circleBtnSecondary: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    // Custom mapping rotation or style if needed
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
