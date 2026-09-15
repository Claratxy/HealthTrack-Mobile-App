import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, shadow } from './theme';

export const common = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  screenPadded: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  cardRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  cardCream: {
    backgroundColor: colors.cream, borderRadius: radius.xl, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.creamDark,
  },

  iconBadge: { width: 42, height: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  thumbImage: { width: 46, height: 46, borderRadius: radius.md, marginRight: spacing.md },

  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.xs },
  overline: { ...typography.overline, color: colors.textMuted, marginBottom: spacing.xs },
  emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: spacing.xxl },

  label: { ...typography.captionStrong, color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md,
    paddingVertical: spacing.md, fontSize: 15, borderWidth: 1.5, borderColor: colors.border, color: colors.textPrimary,
  },
  row: { flexDirection: 'row' },

  chip: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.pill,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
    marginRight: spacing.sm, marginBottom: spacing.sm,
  },
  chipSelected: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  chipText: { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
  chipTextSelected: { color: colors.textOnPrimary, fontWeight: '700' },

  primaryBtn: {
    backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.md + 4,
    alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xxxl, ...shadow.md,
  },
  primaryBtnText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },

  fab: {
    position: 'absolute', right: spacing.xl, bottom: spacing.xl, width: 58, height: 58,
    borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', ...shadow.lg,
  },

  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg },
  toggleTrack: { width: 46, height: 27, borderRadius: radius.pill, backgroundColor: colors.border, padding: 3 },
  toggleTrackOn: { backgroundColor: colors.primary },
  toggleThumb: { width: 21, height: 21, borderRadius: radius.pill, backgroundColor: colors.surface, ...shadow.xs },
  toggleThumbOn: { alignSelf: 'flex-end' },
});