import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { getHealthRecordById, addHealthRecord, updateHealthRecord } from '../services/storage';
import { todayString } from '../utils/dateUtils';
import FormField from '../components/FormField';
import DateTimeField from '../components/DateTimeField';
import { colors, spacing, radius, shadow, typography } from '../styles/theme';

const RECORD_TYPES = ['Health Note', 'Symptom Note', 'Measurement', 'Medical Event', 'General Health Record'];

export default function HealthRecordFormScreen({ route, navigation }) {
  const recordId = route.params?.recordId || null;
  const isEditMode = !!recordId;

  const [loading, setLoading] = useState(isEditMode);
  const [type, setType] = useState(RECORD_TYPES[0]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayString());
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEditMode) return;
    (async () => {
      const rec = await getHealthRecordById(recordId);
      if (rec) {
        setType(rec.type);
        setTitle(rec.title);
        setDate(rec.date);
        setValue(rec.value || '');
        setDescription(rec.description || '');
        setNotes(rec.notes || '');
      }
      setLoading(false);
    })();
  }, [recordId, isEditMode]);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Title is required.';
    if (isNaN(new Date(date).getTime())) e.date = 'Please select a valid date.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const recordData = {
      type, title: title.trim(), date, value: value.trim(), description: description.trim(), notes: notes.trim(),
    };

    if (isEditMode) await updateHealthRecord(recordId, recordData);
    else await addHealthRecord(recordData);

    navigation.goBack();
  };

  if (loading) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>{isEditMode ? 'Edit Record' : 'New Health Record'}</Text>
      <Text style={styles.screenSubtitle}>
        {isEditMode ? 'Update the details below.' : 'Capture a note, symptom, or measurement.'}
      </Text>

      <Text style={styles.groupLabel}>Record Type</Text>
      <View style={styles.typeRow}>
        {RECORD_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeChip, type === t && styles.typeChipSelected]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.typeChipText, type === t && styles.typeChipTextSelected]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FormField
        label="Title" required value={title} onChangeText={setTitle}
        placeholder="e.g. Felt tired in the afternoon" error={errors.title} maxLength={60}
      />

      <DateTimeField label="Date" mode="date" required value={date} onChange={setDate} error={errors.date} />

      <FormField
        label="Value (optional)" value={value} onChangeText={setValue}
        placeholder="e.g. 120/80, 70kg" helperText="Useful for measurements — blood pressure, weight, etc."
      />

      <FormField
        label="Description" value={description} onChangeText={setDescription}
        placeholder="Describe what happened" multiline maxLength={250}
      />

      <FormField
        label="Notes" value={notes} onChangeText={setNotes}
        placeholder="Optional additional notes" multiline maxLength={150}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Text style={styles.saveBtnText}>{isEditMode ? 'Save Changes' : 'Save Record'}</Text>
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
  typeRow: { flexDirection: 'row', flexWrap: 'wrap' },
  typeChip: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border, marginRight: spacing.sm, marginBottom: spacing.sm,
  },
  typeChipSelected: { backgroundColor: colors.accentPurple, borderColor: colors.accentPurple },
  typeChipText: { fontSize: 12, color: colors.textPrimary, fontWeight: '600' },
  typeChipTextSelected: { color: colors.textOnPrimary },
  saveBtn: {
    backgroundColor: colors.accentPurple, borderRadius: radius.lg, paddingVertical: spacing.md + 4,
    alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xxxl, ...shadow.md,
  },
  saveBtnText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
});