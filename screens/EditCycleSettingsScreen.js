import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { getCycleData, saveCycleData } from '../services/storage';
import { colors, spacing, radius, shadow, typography } from '../styles/theme';

export default function EditCycleSettingsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [averageCycleLength, setAverageCycleLength] = useState('28');
  const [averagePeriodLength, setAveragePeriodLength] = useState('5');

  useEffect(() => {
    (async () => {
      const data = await getCycleData();
      setAverageCycleLength(String(data.averageCycleLength));
      setAveragePeriodLength(String(data.averagePeriodLength));
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    await saveCycleData({
      averageCycleLength: Number(averageCycleLength) || 28,
      averagePeriodLength: Number(averagePeriodLength) || 5,
    });
    navigation.goBack();
  };

  if (loading) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Cycle Settings</Text>
      <Text style={styles.screenSubtitle}>Adjust your averages for more accurate estimates.</Text>

      <Text style={styles.label}>Average Cycle Length (days)</Text>
      <TextInput
        style={styles.input}
        value={averageCycleLength}
        onChangeText={setAverageCycleLength}
        keyboardType="numeric"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Average Period Length (days)</Text>
      <TextInput
        style={styles.input}
        value={averagePeriodLength}
        onChangeText={setAveragePeriodLength}
        keyboardType="numeric"
        placeholderTextColor={colors.textMuted}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Text style={styles.saveBtnText}>Save Settings</Text>
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