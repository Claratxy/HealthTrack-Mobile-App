import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getCycleData, getCycleLogs, deleteCycleLog } from '../services/storage';
import {
  calculateNextPeriodDate,
  daysUntilNextPeriod,
  calculateFertileWindow,
} from '../utils/cycleCalculator';
import { colors, spacing, radius, shadow, typography } from '../styles/theme';

export default function CycleScreen({ navigation }) {
  const [cycleData, setCycleData] = useState(null);
  const [logs, setLogs] = useState([]);

  const loadData = useCallback(async () => {
    const data = await getCycleData();
    const logList = await getCycleLogs();
    setCycleData(data);
    setLogs(logList.sort((a, b) => b.startDate.localeCompare(a.startDate)));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDeleteLog = (id) => {
    Alert.alert('Delete Log', 'Remove this cycle log entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCycleLog(id);
          loadData();
        },
      },
    ]);
  };

  if (!cycleData) return null;

  const nextPeriod = calculateNextPeriodDate(cycleData.lastPeriodStartDate, cycleData.averageCycleLength);
  const daysUntil = daysUntilNextPeriod(nextPeriod);
  const fertileWindow = calculateFertileWindow(nextPeriod);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('EditCycleSettings')}>
        <Ionicons name="settings-outline" size={16} color={colors.accentPinkDark} />
        <Text style={styles.settingsBtnText}>Cycle Settings</Text>
      </TouchableOpacity>

      {!cycleData.lastPeriodStartDate ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="water-outline" size={30} color={colors.accentPinkDark} />
          </View>
          <Text style={styles.emptyText}>
            No cycle information yet. Log your last period start date to see estimates.
          </Text>
          <TouchableOpacity style={styles.logBtn} onPress={() => navigation.navigate('AddCycleLog')} activeOpacity={0.85}>
            <Text style={styles.logBtnText}>Log Period Start</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Estimated Next Period</Text>
            <Text style={styles.summaryDate}>{nextPeriod}</Text>
            <View style={styles.summaryPill}>
              <Text style={styles.summarySubtext}>
                {daysUntil >= 0 ? `In ${daysUntil} day${daysUntil === 1 ? '' : 's'}` : `${Math.abs(daysUntil)} days overdue`}
              </Text>
            </View>
          </View>

          {fertileWindow && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Estimated Fertile Window</Text>
              <Text style={styles.infoValue}>{fertileWindow.start} — {fertileWindow.end}</Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Cycle Averages</Text>
            <Text style={styles.infoValue}>
              {cycleData.averageCycleLength} day cycle · {cycleData.averagePeriodLength} day period
            </Text>
          </View>

          <Text style={styles.disclaimer}>
            These are estimates based on your logged information, not medical predictions.
          </Text>

          <TouchableOpacity style={styles.logBtn} onPress={() => navigation.navigate('AddCycleLog')} activeOpacity={0.85}>
            <Text style={styles.logBtnText}>Log New Period Start</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.sectionTitle}>Cycle History</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.emptyHistoryText}>No logs recorded yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.logRow}>
            <View style={styles.logDateWrap}>
              <Ionicons name="water" size={13} color={colors.accentPink} />
              <Text style={styles.logDate}>{item.startDate}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteLog(item.id)} hitSlop={8}>
              <Ionicons name="trash-outline" size={17} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  settingsBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginBottom: spacing.md },
  settingsBtnText: { color: colors.accentPinkDark, fontWeight: '700', marginLeft: 4, fontSize: 13 },
  emptyCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xxl, alignItems: 'center',
    marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  emptyIconWrap: {
    width: 64, height: 64, borderRadius: radius.pill, backgroundColor: colors.accentPinkLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  emptyText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: spacing.lg, lineHeight: 19 },
  summaryCard: {
    backgroundColor: colors.accentPinkLight, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryLabel: { ...typography.overline, color: colors.accentPinkDark },
  summaryDate: { fontSize: 28, fontWeight: '800', color: colors.accentPink, marginTop: spacing.xs, letterSpacing: -0.5 },
  summaryPill: {
    backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.md,
    paddingVertical: 5, marginTop: spacing.sm,
  },
  summarySubtext: { fontSize: 12, color: colors.accentPinkDark, fontWeight: '700' },
  infoCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  infoLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4, fontWeight: '600' },
  infoValue: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  disclaimer: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginVertical: spacing.md, lineHeight: 15 },
  logBtn: {
    backgroundColor: colors.accentPink, borderRadius: radius.lg, paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl, alignItems: 'center', ...shadow.sm,
  },
  logBtnText: { color: colors.textOnPrimary, fontWeight: '700', fontSize: 15 },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.sm },
  emptyHistoryText: { fontSize: 13, color: colors.textMuted },
  logRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  logDateWrap: { flexDirection: 'row', alignItems: 'center' },
  logDate: { fontSize: 14, color: colors.textPrimary, fontWeight: '500', marginLeft: spacing.sm },
});