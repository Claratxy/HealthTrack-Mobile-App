import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadow } from '../styles/theme';

const TYPE_ICONS = {
  'Health Note': 'document-text-outline',
  'Symptom Note': 'alert-circle-outline',
  Measurement: 'speedometer-outline',
  'Medical Event': 'medical-outline',
  'General Health Record': 'clipboard-outline',
};

export default function HealthRecordCard({ record, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={TYPE_ICONS[record.type] || 'document-text-outline'} size={19} color={colors.accentPurpleDark} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{record.title}</Text>
        <Text style={styles.meta}>{record.type} · {record.date}</Text>
        {!!record.description && (
          <Text style={styles.description} numberOfLines={2}>{record.description}</Text>
        )}
        {!!record.value && <Text style={styles.value}>Value: {record.value}</Text>}
      </View>
      {onDelete && (
        <TouchableOpacity onPress={onDelete} hitSlop={8} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={17} color={colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.accentPurpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  title: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.1 },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  description: { fontSize: 13, color: colors.textPrimary, marginTop: 6, lineHeight: 18, opacity: 0.85 },
  value: { fontSize: 13, color: colors.accentPurpleDark, marginTop: 4, fontWeight: '700' },
  deleteBtn: { padding: 4, marginLeft: spacing.xs },
});