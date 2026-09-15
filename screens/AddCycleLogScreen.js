import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { addCycleLog, getCycleData, saveCycleData } from '../services/storage';
import { calculateNextPeriodDate } from '../utils/cycleCalculator';
import { scheduleCycleReminder } from '../services/notifications';
import { todayString } from '../utils/dateUtils';
import { colors, spacing, radius, shadow, typography } from '../styles/theme';

export default function AddCycleLogScreen({ navigation }) {
  const [startDate, setStartDate] = useState(todayString());

  const handleSave = async () => {
    if (isNaN(new Date(startDate).getTime())) {
      Alert.alert('Invalid date', 'Please enter a valid date (YYYY-MM-DD).');
      return;
    }

    await addCycleLog({ startDate });

    const cycleData = await getCycleData();
    const updated = await saveCycleData({ lastPeriodStartDate: startDate, trackingEnabled: true });

    const nextPeriod = calculateNextPeriodDate(startDate, updated.averageCycleLength);
    if (nextPeriod) {
      await scheduleCycleReminder(nextPeriod, 1);
    }

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Log Period Start</Text>
      <Text style={styles.screenSubtitle}>Enter the date your period began.</Text>

      <Text style={styles.label}>Period Start Date</Text>
      <TextInput
        style={styles.input}
        value={startDate}
        onChangeText={setStartDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.textMuted}
      />
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Text style={styles.saveBtnText}>Save Log</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  screenTitle: { ...typography.h1, color: colors.textPrimary },
  screenSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.xl },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md,
    paddingVertical: spacing.md, fontSize: 15, borderWidth: 1.5, borderColor: colors.border, color: colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: colors.accentPink, borderRadius: radius.lg, paddingVertical: spacing.md + 2,
    alignItems: 'center', marginTop: spacing.xxl, ...shadow.md,
  },
  saveBtnText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: '700' },
});