import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { getProfile, saveProfile } from '../services/storage';
import FormField from '../components/FormField';
import DateTimeField from '../components/DateTimeField';
import { colors, spacing, radius, shadow, typography } from '../styles/theme';

const GENDER_OPTIONS = ['Female', 'Male', 'Other', 'Prefer not to say'];

export default function EditProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [contactInformation, setContactInformation] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      setName(p.name || '');
      setGender(p.gender || '');
      setDateOfBirth(p.dateOfBirth || '');
      setContactInformation(p.contactInformation || '');
      setEmergencyContact(p.emergencyContact || '');
      setLoading(false);
    })();
  }, []);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required.';
    if (dateOfBirth && new Date(dateOfBirth) > new Date()) {
      e.dateOfBirth = 'Date of birth cannot be in the future.';
    }
    if (contactInformation && !/^[\d+\-\s()]{6,}$|^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInformation.trim())) {
      e.contactInformation = 'Enter a valid phone number or email.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    await saveProfile({
      name: name.trim(), gender, dateOfBirth,
      contactInformation: contactInformation.trim(),
      emergencyContact: emergencyContact.trim(),
    });
    navigation.goBack();
  };

  if (loading) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Edit Profile</Text>
      <Text style={styles.screenSubtitle}>Keep your details up to date.</Text>

      <FormField
        label="Name" required value={name} onChangeText={setName}
        placeholder="Your name" error={errors.name} maxLength={50}
      />

      <Text style={styles.groupLabel}>Gender</Text>
      <View style={styles.chipRow}>
        {GENDER_OPTIONS.map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.chip, gender === g && styles.chipSelected]}
            onPress={() => setGender(g)}
          >
            <Text style={[styles.chipText, gender === g && styles.chipTextSelected]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <DateTimeField
        label="Date of Birth" mode="date" value={dateOfBirth} onChange={setDateOfBirth}
        maximumDate={new Date()} error={errors.dateOfBirth}
      />

      <FormField
        label="Contact Information" value={contactInformation} onChangeText={setContactInformation}
        placeholder="Phone or email" keyboardType="email-address" autoCapitalize="none"
        error={errors.contactInformation} helperText="Used for your own reference only — never shared."
      />

      <FormField
        label="Emergency Contact" value={emergencyContact} onChangeText={setEmergencyContact}
        placeholder="Name and phone number" maxLength={100}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Text style={styles.saveBtnText}>Save Profile</Text>
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md + 2, borderRadius: radius.pill, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border, marginRight: spacing.sm, marginBottom: spacing.sm,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
  chipTextSelected: { color: colors.textOnPrimary, fontWeight: '700' },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.md + 4,
    alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xxxl, ...shadow.md,
  },
  saveBtnText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
});