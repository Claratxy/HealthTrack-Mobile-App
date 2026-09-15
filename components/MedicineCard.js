import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadow, statusColors } from '../styles/theme';

export default function MedicineCard({ medicine, occurrence, onMarkTaken, onMarkSkipped }) {
  const status = occurrence ? occurrence.status : 'Pending';
  const canAct = status === 'Pending' || status === 'Missed';

  return (
    <View style={styles.card}>
      {medicine.image ? (
        <Image source={{ uri: medicine.image }} style={styles.thumb} />
      ) : (
        <View style={styles.iconWrap}>
          <Ionicons name="medkit" size={19} color={colors.primaryDark} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>{medicine.name}</Text>
        <Text style={styles.detail}>
          {medicine.dosage} {medicine.unit} · {occurrence?.scheduledTime || medicine.times?.[0]}
        </Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColors[status] }]} />
          <Text style={[styles.status, { color: statusColors[status] }]}>{status}</Text>
        </View>
      </View>
      {canAct && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={onMarkTaken} hitSlop={8}>
            <Ionicons name="checkmark-circle" size={29} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onMarkSkipped} hitSlop={8}>
            <Ionicons name="close-circle" size={29} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  iconWrap: {
    width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  thumb: { width: 46, height: 46, borderRadius: radius.md, marginRight: spacing.md },
  name: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.1 },
  detail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  status: { fontSize: 12, fontWeight: '700', letterSpacing: 0.1 },
  actions: { flexDirection: 'row' },
  actionBtn: { marginLeft: 4 },
});