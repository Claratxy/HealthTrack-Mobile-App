import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { getAppointmentById, addAppointment, updateAppointment } from '../services/storage';
import { scheduleAppointmentReminder, cancelNotification } from '../services/notifications';
import { todayString } from '../utils/dateUtils';
import { isPastDateTime } from '../utils/validation';
import ImagePickerField from '../components/ImagePickerField';
import FormField from '../components/FormField';
import DateTimeField from '../components/DateTimeField';
import { colors, spacing, radius, shadow } from '../styles/theme';

export default function AppointmentFormScreen({ route, navigation }) {
  const appointmentId = route.params?.appointmentId || null;
  const isEditMode = !!appointmentId;

  const [loading, setLoading] = useState(isEditMode);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('General');
  const [date, setDate] = useState(todayString());
  const [time, setTime] = useState('09:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEditMode) return;
    (async () => {
      const appt = await getAppointmentById(appointmentId);
      if (appt) {
        setTitle(appt.title);
        setType(appt.type || '');
        setDate(appt.date);
        setTime(appt.time);
        setLocation(appt.location || '');
        setNotes(appt.notes || '');
        setImage(appt.image || null);
      }
      setLoading(false);
    })();
  }, [appointmentId, isEditMode]);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Appointment title is required.';
    if (isNaN(new Date(date).getTime())) e.date = 'Please select a valid date.';
    else if (isPastDateTime(date, time)) e.date = 'Appointments cannot be scheduled in the past.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    if (isEditMode) {
      const existing = await getAppointmentById(appointmentId);
      if (existing?.notificationId) await cancelNotification(existing.notificationId);
      const notificationId = await scheduleAppointmentReminder(title.trim(), date, time, 30);
      await updateAppointment(appointmentId, {
        title: title.trim(), type, date, time, location: location.trim(), notes: notes.trim(),
        image, notificationId: notificationId || null,
      });
    } else {
      const savedAppt = await addAppointment({
        title: title.trim(), type, date, time, location: location.trim(), notes: notes.trim(), image,
      });
      const notificationId = await scheduleAppointmentReminder(title.trim(), date, time, 30);
      if (notificationId) await updateAppointment(savedAppt.id, { notificationId });
    }

    navigation.goBack();
  };

  if (loading) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>{isEditMode ? 'Edit Appointment' : 'New Appointment'}</Text>
      <Text style={styles.screenSubtitle}>
        {isEditMode ? 'Update the details below.' : 'Fill in the details for your appointment.'}
      </Text>

      <FormField
        label="Title" required value={title} onChangeText={setTitle}
        placeholder="e.g. Dental Check-up" error={errors.title} maxLength={60}
      />
      <FormField label="Type" value={type} onChangeText={setType} placeholder="e.g. Dental, GP, Specialist" />

      <DateTimeField label="Date" mode="date" required value={date} onChange={setDate} minimumDate={new Date()} error={errors.date} />
      <DateTimeField label="Time" mode="time" required value={time} onChange={setTime} />

      <FormField label="Location" value={location} onChangeText={setLocation} placeholder="e.g. ABC Clinic" maxLength={80} />

      <ImagePickerField value={image} onChange={setImage} label="Appointment Photo (optional)" />

      <FormField label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional notes" multiline maxLength={200} />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Text style={styles.saveBtnText}>{isEditMode ? 'Save Changes' : 'Save Appointment'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  screenTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.4 },
  screenSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.sm },
  saveBtn: {
    backgroundColor: colors.secondary, borderRadius: radius.lg, paddingVertical: spacing.md + 4,
    alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xxxl, ...shadow.md,
  },
  saveBtnText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
});