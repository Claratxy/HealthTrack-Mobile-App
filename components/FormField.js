import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../styles/theme';

export default function FormField({
  label, value, onChangeText, error, required, helperText,
  maxLength, multiline, ...inputProps
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}> *</Text>}
        {maxLength && (
          <Text style={styles.counter}>{(value || '').length}/{maxLength}</Text>
        )}
      </View>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        multiline={multiline}
        placeholderTextColor={colors.textMuted}
        {...inputProps}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.md },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  required: { color: colors.danger, fontWeight: '700' },
  counter: { marginLeft: 'auto', fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md,
    paddingVertical: spacing.md, fontSize: 15, borderWidth: 1.5, borderColor: colors.border,
    color: colors.textPrimary,
  },
  multiline: { height: 96, textAlignVertical: 'top', lineHeight: 21 },
  inputError: { borderColor: colors.danger, backgroundColor: colors.dangerLight },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 4, fontWeight: '600' },
  helperText: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
});