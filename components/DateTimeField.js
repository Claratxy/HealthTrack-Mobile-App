import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../utils/dateUtils'; // add this import
import { colors, spacing, radius } from '../styles/theme';

// value: 'YYYY-MM-DD' string (for date mode) or 'HH:MM' string (for time mode)
export default function DateTimeField({
  label, value, onChange, mode = 'date', error, required, minimumDate,
}) {
  const [showPicker, setShowPicker] = useState(false);

  const toDateObject = () => {
    if (mode === 'time') {
      const [h, m] = (value || '00:00').split(':').map(Number);
      const d = new Date();
      d.setHours(h || 0, m || 0, 0, 0);
      return d;
    }
    const d = value ? new Date(value) : new Date();
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const handleChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios'); // iOS keeps the picker open inline
    if (event.type === 'dismissed' || !selectedDate) return;

    if (mode === 'time') {
      const hh = String(selectedDate.getHours()).padStart(2, '0');
      const mm = String(selectedDate.getMinutes()).padStart(2, '0');
      onChange(`${hh}:${mm}`);
    } else {
      onChange(formatDate(selectedDate));
    }
  };

  const displayValue = () => {
    if (!value) return mode === 'time' ? 'Select time' : 'Select date';
    if (mode === 'time') return value;
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}> *</Text>}
      </View>
      <TouchableOpacity
        style={[styles.field, error && styles.fieldError]}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <View style={styles.iconWrap}>
          <Ionicons
            name={mode === 'time' ? 'time-outline' : 'calendar-outline'}
            size={17}
            color={colors.primaryDark}
          />
        </View>
        <Text style={[styles.valueText, !value && styles.placeholderText]}>{displayValue()}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} style={styles.chevron} />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {showPicker && (
        <DateTimePicker
          value={toDateObject()}
          mode={mode}
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.md },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  required: { color: colors.danger, fontWeight: '700' },
  field: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, borderWidth: 1.5, borderColor: colors.border,
  },
  fieldError: { borderColor: colors.danger },
  iconWrap: {
    width: 30, height: 30, borderRadius: radius.sm, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm,
  },
  valueText: { flex: 1, fontSize: 15, color: colors.textPrimary, fontWeight: '500' },
  placeholderText: { color: colors.textMuted, fontWeight: '400' },
  chevron: { marginLeft: spacing.xs },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 4, fontWeight: '600' },
});