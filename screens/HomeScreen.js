import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow, entityColors } from '../styles/theme';
import { cancelNotification } from '../services/notifications';

import ProgressBar from '../components/ProgressBar';
import MedicineCard from '../components/MedicineCard';
import AppointmentCard from '../components/AppointmentCard';
import {
  getMedicines,
  getMedicineOccurrences,
  updateOccurrenceStatus,
  getAppointments,
} from '../services/storage';
import { todayString, sortByDateTimeAsc } from '../utils/dateUtils';
import { isOccurrenceMissed } from '../utils/reminderUtils';

export default function HomeScreen({ navigation }) {
  const [medicines, setMedicines] = useState([]);
  const [occurrences, setOccurrences] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [meds, occs, appts] = await Promise.all([
      getMedicines(),
      getMedicineOccurrences(),
      getAppointments(),
    ]);

    // Auto-flip any stale Pending occurrences from today (or earlier) to Missed.
    const todayOccs = occs.filter((o) => o.date === todayString());
    for (const occ of todayOccs) {
      if (isOccurrenceMissed(occ)) {
        await updateOccurrenceStatus(occ.id, 'Missed');
        occ.status = 'Missed'; // keep local copy in sync so we don't re-fetch
      }
    }

    setMedicines(meds);
    setOccurrences(todayOccs);
    setAppointments(appts);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStatusChange = async (occ, status) => {
    if (occ.notificationId) {
      await cancelNotification(occ.notificationId);
    }
    await updateOccurrenceStatus(occ.id, status);
    loadData();
  };

  const completedCount = occurrences.filter((o) => o.status === 'Taken').length;
  const totalCount = occurrences.length;

  const upcomingAppointment = sortByDateTimeAsc(
    appointments.filter((a) => a.status !== 'Completed' && a.date >= todayString())
  )[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={styles.greeting}>Keep Track. Keep Healthy.</Text>
      <Text style={styles.dateText}>{new Date().toDateString()}</Text>

      <ProgressBar completed={completedCount} total={totalCount} />

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('MedicineForm')} activeOpacity={0.8}>
          <View style={[styles.quickIconWrap, { backgroundColor: entityColors.medicine.light }]}>
            <Ionicons name="add" size={16} color={entityColors.medicine.dark} />
          </View>
          <Text style={styles.quickBtnText}>Add Medicine</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('AppointmentForm')} activeOpacity={0.8}>
          <View style={[styles.quickIconWrap, { backgroundColor: entityColors.appointment.light }]}>
            <Ionicons name="add" size={16} color={entityColors.appointment.dark} />
          </View>
          <Text style={styles.quickBtnText}>Add Appointment</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Today's Medicines</Text>
      {occurrences.length === 0 && (
        <View style={styles.emptyCard}>
          <Ionicons name="checkmark-done-circle-outline" size={22} color={colors.textMuted} />
          <Text style={styles.emptyText}>Nothing scheduled today.</Text>
        </View>
      )}
      {occurrences.map((occ) => {
        const med = medicines.find((m) => m.id === occ.medicineId);
        if (!med) return null;
        return (
          <MedicineCard
            key={occ.id}
            medicine={med}
            occurrence={occ}
            onMarkTaken={() => handleStatusChange(occ, 'Taken')}
            onMarkSkipped={() => handleStatusChange(occ, 'Skipped')}
          />
        );
      })}

      <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
      {upcomingAppointment ? (
        <AppointmentCard appointment={upcomingAppointment} onPress={() => {}} />
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-clear-outline" size={22} color={colors.textMuted} />
          <Text style={styles.emptyText}>No upcoming appointments.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  greeting: { ...typography.h1, color: colors.primaryDark },
  dateText: { fontSize: 14, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.lg },
  quickActions: { flexDirection: 'row', marginBottom: spacing.xl },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.xs,
  },
  quickIconWrap: {
    width: 24, height: 24, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center',
  },
  quickBtnText: { marginLeft: spacing.sm, fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.sm },
  emptyCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md,
  },
  emptyText: { color: colors.textMuted, fontSize: 13, marginLeft: spacing.sm },
});