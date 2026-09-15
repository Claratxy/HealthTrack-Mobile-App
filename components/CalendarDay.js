import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { colors, radius, shadow } from '../styles/theme';

export default function CalendarDay({ day, isCurrentMonth, isToday, isSelected, indicators, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.cell,
        isSelected && styles.cellSelected,
        isToday && !isSelected && styles.cellToday,
      ]}
      onPress={onPress}
      disabled={!day}
      activeOpacity={0.7}
    >
      {day ? (
        <>
          <Text
            style={[
              styles.dayText,
              !isCurrentMonth && styles.dayTextFaded,
              isSelected && styles.dayTextSelected,
              isToday && !isSelected && styles.dayTextToday,
            ]}
          >
            {day}
          </Text>
          <View style={styles.dotsRow}>
            {indicators.map((color, idx) => (
              <View key={idx} style={[styles.dot, { backgroundColor: isSelected ? colors.textOnPrimary : color }]} />
            ))}
          </View>
        </>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
    borderRadius: radius.md, marginVertical: 2,
  },
  cellSelected: { backgroundColor: colors.primary, ...shadow.sm },
  cellToday: { backgroundColor: colors.primaryLight },
  dayText: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  dayTextFaded: { color: colors.textMuted, opacity: 0.4 },
  dayTextSelected: { color: colors.textOnPrimary, fontWeight: '700' },
  dayTextToday: { color: colors.primaryDark, fontWeight: '700' },
  dotsRow: { flexDirection: 'row', marginTop: 3, height: 6 },
  dot: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 1 },
});