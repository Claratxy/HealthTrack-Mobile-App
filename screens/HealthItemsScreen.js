import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  getMedicines, deleteMedicine, getMedicineOccurrences,
  getAppointments, deleteAppointment, updateAppointment,
} from '../services/storage';
import { cancelNotification } from '../services/notifications';
import { sortByDateTimeAsc } from '../utils/dateUtils';
import { colors, spacing, radius, shadow, typography, entityColors } from '../styles/theme';

export default function HealthItemsScreen({ navigation }) {
  const [tab, setTab] = useState('Medicines');
  const [medicines, setMedicines] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const loadData = useCallback(async () => {
    const [meds, appts] = await Promise.all([getMedicines(), getAppointments()]);
    setMedicines(meds);
    setAppointments(sortByDateTimeAsc(appts));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDeleteMedicine = (id, name) => {
    Alert.alert('Delete Medicine', `Delete "${name}" and all its scheduled occurrences?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const occurrences = await getMedicineOccurrences();
          const toCancel = occurrences.filter((o) => o.medicineId === id);
          for (const occ of toCancel) {
            if (occ.notificationId) await cancelNotification(occ.notificationId);
          }
          await deleteMedicine(id);
          loadData();
        },
      },
    ]);
  };

  const handleDeleteAppointment = (id, title) => {
    Alert.alert('Delete Appointment', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const appt = appointments.find((a) => a.id === id);
          if (appt?.notificationId) await cancelNotification(appt.notificationId);
          await deleteAppointment(id);
          loadData();
        },
      },
    ]);
  };

  const handleCompleteAppointment = async (id) => {
    const appt = appointments.find((a) => a.id === id);
    if (appt?.notificationId) {
      await cancelNotification(appt.notificationId);
    }
    await updateAppointment(id, { status: 'Completed' });
    loadData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[styles.segment, tab === 'Medicines' && styles.segmentActive]}
          onPress={() => setTab('Medicines')}
        >
          <Text style={[styles.segmentText, tab === 'Medicines' && styles.segmentTextActive]}>Medicines</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, tab === 'Appointments' && styles.segmentActive]}
          onPress={() => setTab('Appointments')}
        >
          <Text style={[styles.segmentText, tab === 'Appointments' && styles.segmentTextActive]}>Appointments</Text>
        </TouchableOpacity>
      </View>

      {tab === 'Medicines' ? (
        <FlatList
          data={medicines}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="medkit-outline" size={36} color={colors.textMuted} />
              <Text style={styles.emptyText}>No medicines added yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('MedicineForm', { medicineId: item.id })}
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <Ionicons name="medkit-outline" size={19} color={entityColors.medicine.dark} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.detail}>{item.dosage} {item.unit} · {item.times?.join(', ')}</Text>
                <Text style={styles.detail}>
                  {item.isRecurring ? `${item.startDate} → ${item.endDate}` : `One-time · ${item.startDate}`}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteMedicine(item.id, item.name)} hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="calendar-outline" size={36} color={colors.textMuted} />
              <Text style={styles.emptyText}>No appointments added yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('AppointmentForm', { appointmentId: item.id })}
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: entityColors.appointment.light }]}>
                  <Ionicons name="calendar-outline" size={19} color={entityColors.appointment.dark} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.detail}>{item.date} · {item.time}</Text>
                {!!item.location && <Text style={styles.detail} numberOfLines={1}>{item.location}</Text>}
                <View style={styles.statusPill}>
                  <Text style={styles.status}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                {item.status !== 'Completed' && (
                  <TouchableOpacity onPress={() => handleCompleteAppointment(item.id)} style={styles.actionBtn} hitSlop={8}>
                    <Ionicons name="checkmark-circle-outline" size={21} color={colors.primary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDeleteAppointment(item.id, item.title)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: tab === 'Medicines' ? colors.primary : colors.secondary }]}
        onPress={() => navigation.navigate(tab === 'Medicines' ? 'MedicineForm' : 'AppointmentForm')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={colors.textOnPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  segmentRow: {
    flexDirection: 'row', margin: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: 4, borderWidth: 1, borderColor: colors.border,
  },
  segment: { flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radius.md, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.textPrimary },
  segmentText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  segmentTextActive: { color: colors.textOnPrimary },
  listContent: { padding: spacing.lg, paddingTop: 0, paddingBottom: 110 },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xxxl },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  thumb: { width: 46, height: 46, borderRadius: radius.md, marginRight: spacing.md },
  thumbPlaceholder: { backgroundColor: entityColors.medicine.light, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.1 },
  detail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  statusPill: {
    alignSelf: 'flex-start', backgroundColor: entityColors.appointment.light, borderRadius: radius.pill,
    paddingHorizontal: 8, paddingVertical: 2, marginTop: 5,
  },
  status: { fontSize: 11, fontWeight: '700', color: entityColors.appointment.dark },
  emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: spacing.sm },
  actions: { alignItems: 'center' },
  actionBtn: { marginBottom: spacing.sm },
  fab: {
    position: 'absolute', right: spacing.xl, bottom: spacing.xl, width: 58, height: 58, borderRadius: radius.pill,
    alignItems: 'center', justifyContent: 'center', ...shadow.lg,
  },
});