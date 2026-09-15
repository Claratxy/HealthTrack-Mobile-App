import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import CalendarDay from '../components/CalendarDay';
import {
  getMedicines,
  getMedicineOccurrences,
  getAppointments,
  getHealthRecords,
  getCycleData,
  getProfile,
} from '../services/storage';
import { buildMonthGrid, MONTH_NAMES } from '../utils/calendarUtils';
import { generateFutureCycleDates } from '../utils/cycleCalculator';
import { todayString, formatDate } from '../utils/dateUtils';
import { colors, spacing, radius, shadow, typography, entityColors } from '../styles/theme';

const FILTERS = ['All', 'Medicines', 'Appointments', 'Records', 'Cycle'];
const COLORS = {
  medicine: entityColors.medicine.main,
  appointment: entityColors.appointment.main,
  record: entityColors.record.main,
  cycle: entityColors.cycle.main,
};

export default function CalendarScreen() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [filter, setFilter] = useState('All');

  const [medicines, setMedicines] = useState([]);
  const [occurrences, setOccurrences] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [cycleRanges, setCycleRanges] = useState([]);
  const [cycleEnabled, setCycleEnabled] = useState(false);

  const loadData = useCallback(async () => {
    const [meds, occs, appts, recs, cycleData, profile] = await Promise.all([
      getMedicines(),
      getMedicineOccurrences(),
      getAppointments(),
      getHealthRecords(),
      getCycleData(),
      getProfile(),
    ]);
    setMedicines(meds);
    setOccurrences(occs);
    setAppointments(appts);
    setRecords(recs);
    setCycleEnabled(profile.cycleTrackingEnabled);

    if (profile.cycleTrackingEnabled && cycleData.lastPeriodStartDate) {
      setCycleRanges(
        generateFutureCycleDates(
          cycleData.lastPeriodStartDate,
          cycleData.averageCycleLength,
          cycleData.averagePeriodLength,
          6
        )
      );
    } else {
      setCycleRanges([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const isDateInCycleRange = (dateStr) =>
    cycleRanges.some((r) => dateStr >= r.start && dateStr <= r.end);

  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const getIndicatorsForDate = (dateStr) => {
    const indicators = [];
    const hasMedicine = occurrences.some((o) => o.date === dateStr);
    const hasAppointment = appointments.some((a) => a.date === dateStr);
    const hasRecord = records.some((r) => r.date === dateStr);
    const hasCycle = cycleEnabled && isDateInCycleRange(dateStr);

    if ((filter === 'All' || filter === 'Medicines') && hasMedicine) indicators.push(COLORS.medicine);
    if ((filter === 'All' || filter === 'Appointments') && hasAppointment) indicators.push(COLORS.appointment);
    if ((filter === 'All' || filter === 'Records') && hasRecord) indicators.push(COLORS.record);
    if ((filter === 'All' || filter === 'Cycle') && hasCycle) indicators.push(COLORS.cycle);

    return indicators.slice(0, 4);
  };

  // Items for the selected date, respecting the active filter
  const dayItems = useMemo(() => {
    const items = [];

    if (filter === 'All' || filter === 'Medicines') {
      occurrences
        .filter((o) => o.date === selectedDate)
        .forEach((o) => {
          const med = medicines.find((m) => m.id === o.medicineId);
          if (med) {
            items.push({
              key: `occ-${o.id}`,
              type: 'medicine',
              time: o.scheduledTime,
              title: med.name,
              subtitle: `${med.dosage} ${med.unit} · ${o.status}`,
            });
          }
        });
    }

    if (filter === 'All' || filter === 'Appointments') {
      appointments
        .filter((a) => a.date === selectedDate)
        .forEach((a) => {
          items.push({
            key: `appt-${a.id}`,
            type: 'appointment',
            time: a.time,
            title: a.title,
            subtitle: `${a.type || 'Appointment'} · ${a.status}`,
          });
        });
    }

    if (filter === 'All' || filter === 'Records') {
      records
        .filter((r) => r.date === selectedDate)
        .forEach((r) => {
          items.push({
            key: `rec-${r.id}`,
            type: 'record',
            time: '',
            title: r.title,
            subtitle: r.type,
          });
        });
    }

    if ((filter === 'All' || filter === 'Cycle') && cycleEnabled && isDateInCycleRange(selectedDate)) {
      items.push({
        key: `cycle-${selectedDate}`,
        type: 'cycle',
        time: '',
        title: 'Estimated Period',
        subtitle: 'Based on your cycle settings',
      });
    }

    return items.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [selectedDate, filter, occurrences, appointments, records, medicines, cycleEnabled, cycleRanges]);

  const activeFilters = cycleEnabled ? FILTERS : FILTERS.filter((f) => f !== 'Cycle');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.monthNavBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{MONTH_NAMES[viewMonth]} {viewYear}</Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.monthNavBtn} hitSlop={8}>
          <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.weekdayRow}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Text key={i} style={styles.weekdayLabel}>{d}</Text>
          ))}
        </View>

        <View style={styles.grid}>
          {grid.map((cell, idx) => (
            <CalendarDay
              key={idx}
              day={cell.day}
              isCurrentMonth={cell.isCurrentMonth}
              isToday={cell.date === todayString()}
              isSelected={cell.date === selectedDate}
              indicators={getIndicatorsForDate(cell.date)}
              onPress={() => setSelectedDate(cell.date)}
            />
          ))}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {activeFilters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipSelected]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextSelected]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.selectedDateLabel}>{selectedDate}</Text>

      {dayItems.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="calendar-clear-outline" size={28} color={colors.textMuted} />
          <Text style={styles.emptyText}>Nothing scheduled for this day.</Text>
        </View>
      ) : (
        dayItems.map((item) => (
          <View key={item.key} style={styles.itemCard}>
            <View style={[styles.iconWrap, { backgroundColor: `${COLORS[item.type]}1F` }]}>
              <Ionicons
                name={
                  item.type === 'medicine' ? 'medkit-outline'
                  : item.type === 'appointment' ? 'calendar-outline'
                  : item.type === 'cycle' ? 'water-outline'
                  : 'document-text-outline'
                }
                size={18}
                color={COLORS[item.type]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            </View>
            {!!item.time && <Text style={styles.itemTime}>{item.time}</Text>}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  monthHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md,
  },
  monthNavBtn: {
    width: 36, height: 36, borderRadius: radius.pill, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  monthTitle: { ...typography.h3, color: colors.textPrimary },
  calendarCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, ...shadow.sm, marginBottom: spacing.lg,
  },
  weekdayRow: { flexDirection: 'row', marginBottom: 4 },
  weekdayLabel: { width: `${100 / 7}%`, textAlign: 'center', fontSize: 12, color: colors.textMuted, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  filterRow: { marginBottom: spacing.lg },
  filterChip: {
    paddingVertical: 7, paddingHorizontal: 15, borderRadius: radius.pill, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border, marginRight: spacing.sm,
  },
  filterChipSelected: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  filterChipText: { fontSize: 12, color: colors.textPrimary, fontWeight: '500' },
  filterChipTextSelected: { color: colors.textOnPrimary, fontWeight: '700' },
  selectedDateLabel: { ...typography.overline, color: colors.textMuted, marginBottom: spacing.sm },
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyText: { color: colors.textMuted, fontSize: 13, marginTop: spacing.sm },
  itemCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, ...shadow.xs,
  },
  iconWrap: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  itemTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  itemSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  itemTime: { fontSize: 12, color: colors.textMuted, marginLeft: spacing.sm, fontWeight: '600' },
});