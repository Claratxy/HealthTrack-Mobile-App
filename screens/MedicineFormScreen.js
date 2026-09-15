import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import {
  getMedicineById, addMedicine, updateMedicine,
  deleteOccurrencesForMedicine, saveOccurrenceList, addOccurrences, setOccurrenceNotificationId,
} from '../services/storage';
import { scheduleMedicineReminder, cancelNotification } from '../services/notifications';
import { generateRecurringDates, DAY_NAMES, todayString } from '../utils/dateUtils';
import { isPastDateTime, isEndBeforeStart } from '../utils/validation';
import ImagePickerField from '../components/ImagePickerField';
import FormField from '../components/FormField';
import DateTimeField from '../components/DateTimeField';
import { colors, spacing, radius, shadow, typography } from '../styles/theme';

export default function MedicineFormScreen({ route, navigation }) {
  const medicineId = route.params?.medicineId || null;
  const isEditMode = !!medicineId;

  const [loading, setLoading] = useState(isEditMode);
  const [isRecurring, setIsRecurring] = useState(true);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [unit, setUnit] = useState('mg');
  const [time, setTime] = useState('08:00');
  const [startDate, setStartDate] = useState(todayString());
  const [endDate, setEndDate] = useState(todayString());
  const [selectedDays, setSelectedDays] = useState([]);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEditMode) return;
    (async () => {
      const med = await getMedicineById(medicineId);
      if (med) {
        setIsRecurring(med.isRecurring !== false);
        setName(med.name);
        setDosage(med.dosage);
        setUnit(med.unit);
        setTime(med.times?.[0] || '08:00');
        setStartDate(med.startDate);
        setEndDate(med.endDate);
        setSelectedDays(med.selectedDays || []);
        setReminderEnabled(med.reminderEnabled);
        setNotes(med.notes || '');
        setImage(med.image || null);
      }
      setLoading(false);
    })();
  }, [medicineId, isEditMode]);

  const toggleDay = (dayIndex) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Medicine name is required.';
    if (!dosage.trim()) e.dosage = 'Dosage is required.';
    else if (isNaN(Number(dosage))) e.dosage = 'Dosage must be a number.';
    if (isRecurring && isEndBeforeStart(startDate, endDate)) e.endDate = 'End date cannot be before start date.';
    if (isRecurring && startDate === endDate) {
      e.endDate = 'Start and end date are the same — this creates only one dose. Extend the range, or switch to One-time.';
    }
    const effectiveDate = isRecurring ? endDate : startDate;
    if (isPastDateTime(effectiveDate, isRecurring ? null : time)) {
      e.startDate = 'This schedule is entirely in the past.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const effectiveEndDate = isRecurring ? endDate : startDate;

    const medicineData = {
      name: name.trim(),
      dosage: dosage.trim(),
      unit,
      isRecurring,
      frequency: !isRecurring ? 'One-time' : selectedDays.length === 0 ? 'Every day' : 'Custom',
      selectedDays: isRecurring ? selectedDays : [],
      times: [time],
      startDate,
      endDate: effectiveEndDate,
      reminderEnabled,
      notes: notes.trim(),
      image,
    };

    let targetMedicineId = medicineId;

    if (isEditMode) {
      await updateMedicine(medicineId, medicineData);
      const { toRemove, remaining } = await deleteOccurrencesForMedicine(medicineId);
      for (const occ of toRemove) {
        if (occ.notificationId) await cancelNotification(occ.notificationId);
      }
      await saveOccurrenceList(remaining);
    } else {
      const savedMedicine = await addMedicine(medicineData);
      targetMedicineId = savedMedicine.id;
    }

    const dates = isRecurring ? generateRecurringDates(startDate, endDate, selectedDays) : [startDate];
    const futureDates = dates.filter((d) => !isPastDateTime(d, time));

    let savedOccurrences = [];
    if (futureDates.length > 0) {
      savedOccurrences = await addOccurrences(
        futureDates.map((date) => ({ medicineId: targetMedicineId, date, scheduledTime: time, status: 'Pending' }))
      );
    }

    if (reminderEnabled) {
      for (const occ of savedOccurrences.slice(0, 30)) {
        const notificationId = await scheduleMedicineReminder(name.trim(), occ.date, time);
        if (notificationId) await setOccurrenceNotificationId(occ.id, notificationId);
      }
    }

    navigation.goBack();
  };

  if (loading) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>{isEditMode ? 'Edit Medicine' : 'New Medicine'}</Text>
      <Text style={styles.screenSubtitle}>
        {isEditMode ? 'Update the schedule below.' : 'Set up a medicine and its reminder schedule.'}
      </Text>

      <Text style={styles.groupLabel}>Schedule Type</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeChip, isRecurring && styles.typeChipSelected]}
          onPress={() => setIsRecurring(true)}
        >
          <Text style={[styles.typeChipText, isRecurring && styles.typeChipTextSelected]}>Recurring</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeChip, !isRecurring && styles.typeChipSelected]}
          onPress={() => setIsRecurring(false)}
        >
          <Text style={[styles.typeChipText, !isRecurring && styles.typeChipTextSelected]}>One-time</Text>
        </TouchableOpacity>
      </View>

      <FormField
        label="Medicine Name" required value={name} onChangeText={setName}
        placeholder="e.g. Vitamin D" error={errors.name}
      />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <FormField
            label="Dosage" required value={dosage} onChangeText={setDosage}
            placeholder="e.g. 10" keyboardType="numeric" error={errors.dosage}
          />
        </View>
        <View style={{ flex: 1 }}>
          <FormField label="Unit" value={unit} onChangeText={setUnit} placeholder="mg / ml / tablet" />
        </View>
      </View>

      <DateTimeField label="Time" mode="time" required value={time} onChange={setTime} />

      {isRecurring ? (
        <>
          <Text style={styles.groupLabel}>Repeat on days (leave empty for every day)</Text>
          <View style={styles.dayRow}>
            {DAY_NAMES.map((day, index) => (
              <TouchableOpacity
                key={day}
                style={[styles.dayChip, selectedDays.includes(index) && styles.dayChipSelected]}
                onPress={() => toggleDay(index)}
              >
                <Text style={[styles.dayChipText, selectedDays.includes(index) && styles.dayChipTextSelected]}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: spacing.sm}}>
              <DateTimeField label="Start Date" mode="date" required value={startDate} onChange={setStartDate} error={errors.startDate} />
            </View>
            <View style={{ flex: 1 }}>
              <DateTimeField label="End Date" mode="date" required value={endDate} onChange={setEndDate} minimumDate={new Date(startDate)} error={errors.endDate} />
            </View>
          </View>
        </>
      ) : (
        <DateTimeField label="Date" mode="date" required value={startDate} onChange={(d) => { setStartDate(d); setEndDate(d); }} error={errors.startDate} />
      )}

      <TouchableOpacity style={styles.toggleRow} onPress={() => setReminderEnabled(!reminderEnabled)} activeOpacity={0.8}>
        <View>
          <Text style={styles.toggleLabel}>Enable Reminder</Text>
          <Text style={styles.toggleHint}>Get a notification at the scheduled time</Text>
        </View>
        <View style={[styles.toggleTrack, reminderEnabled && styles.toggleTrackOn]}>
          <View style={[styles.toggleThumb, reminderEnabled && styles.toggleThumbOn]} />
        </View>
      </TouchableOpacity>

      <ImagePickerField value={image} onChange={setImage} label="Medicine Photo (optional)" />

      <FormField
        label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional notes"
        multiline maxLength={200}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Text style={styles.saveBtnText}>{isEditMode ? 'Save Changes' : 'Save Medicine'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  screenTitle: { ...typography.h1, color: colors.textPrimary },
  screenSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  groupLabel: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.sm },
  row: { flexDirection: 'row' },
  typeRow: { flexDirection: 'row' },
  typeChip: {
    flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radius.md, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border, marginRight: spacing.sm, alignItems: 'center',
  },
  typeChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeChipText: { fontSize: 13, color: colors.textPrimary, fontWeight: '700' },
  typeChipTextSelected: { color: colors.textOnPrimary },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap' },
  dayChip: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border, marginRight: spacing.sm, marginBottom: spacing.sm,
  },
  dayChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayChipText: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  dayChipTextSelected: { color: colors.textOnPrimary },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg,
    backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  toggleLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  toggleHint: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  toggleTrack: { width: 46, height: 27, borderRadius: radius.pill, backgroundColor: colors.border, padding: 3 },
  toggleTrackOn: { backgroundColor: colors.primary },
  toggleThumb: { width: 21, height: 21, borderRadius: radius.pill, backgroundColor: colors.surface, ...shadow.xs },
  toggleThumbOn: { alignSelf: 'flex-end' },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.md + 4,
    alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xxxl, ...shadow.md,
  },
  saveBtnText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
});