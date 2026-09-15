import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadow, statusColors } from '../styles/theme';

export default function AppointmentCard({ appointment, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.iconWrap}>
        <Ionicons name="calendar" size={21} color={colors.secondaryDark} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{appointment.title}</Text>
        <Text style={styles.detail}>
          {appointment.date} · {appointment.time}
        </Text>
        {!!appointment.location && (
          <Text style={styles.detail} numberOfLines={1}>{appointment.location}</Text>
        )}
      </View>
      <View style={styles.statusPill}>
        <Text style={styles.statusPillText}>{appointment.status}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  iconWrap: {
    width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.secondaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  thumb: { width: 46, height: 46, borderRadius: radius.md, marginRight: spacing.md },
  title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.1 },
  detail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  statusPill: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill,
    backgroundColor: colors.secondaryLight, marginLeft: spacing.sm,
  },
  statusPillText: { fontSize: 11, fontWeight: '700', color: colors.secondaryDark },
});