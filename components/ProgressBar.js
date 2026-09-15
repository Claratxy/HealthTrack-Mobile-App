import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, shadow } from '../styles/theme';

export default function ProgressBar({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.overline}>Today's health progress</Text>
        <Text style={styles.fraction}>{completed} / {total}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.pctLabel}>{pct}% complete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  overline: { ...typography.overline, color: colors.textMuted },
  fraction: { fontSize: 13, fontWeight: '700', color: colors.primaryDark },
  track: { height: 10, backgroundColor: colors.surfaceMuted, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.pill },
  pctLabel: { fontSize: 11, color: colors.textMuted, marginTop: 6, textAlign: 'right', fontWeight: '600' },
});