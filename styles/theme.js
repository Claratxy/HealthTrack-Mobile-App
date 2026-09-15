// Central design tokens — the single source of truth for color, spacing,
// radius, typography, and elevation. Every component/screen StyleSheet
// should import from here instead of hardcoding values.

export const colors = {
  primary: '#1B8A6B',
  primaryDark: '#0F5C46',
  primaryLight: '#E3F5EF',

  secondary: '#3B6FBF',
  secondaryDark: '#2A529A',
  secondaryLight: '#E9F0FB',

  accentPurple: '#8B5CF6',
  accentPurpleDark: '#6D3FD1',
  accentPurpleLight: '#F1EAFB',

  accentPink: '#D6336C',
  accentPinkDark: '#AD2456',
  accentPinkLight: '#FDEEF2',

  cream: '#F3EAD8',
  creamDark: '#E4D5B8',
  creamText: '#7A6339',

  danger: '#E5484D',
  dangerLight: '#FBEAEA',

  warning: '#F5A623',
  warningLight: '#FDF3E3',

  background: '#F7F6F3',
  surface: '#FFFFFF',
  surfaceMuted: '#F0F3F2',
  surfaceSunken: '#EFEDE7',
  border: '#E7EBE9',
  borderStrong: '#D8DEDB',

  textPrimary: '#14181A',
  textSecondary: '#5B6664',
  textMuted: '#9AA5A0',
  textOnPrimary: '#FFFFFF',

  overlay: 'rgba(15, 23, 21, 0.45)',
};

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 22, xxl: 28, pill: 999,
};

export const typography = {
  display: { fontSize: 32, fontWeight: '800', letterSpacing: -0.6, lineHeight: 38 },
  h1: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4, lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '700', letterSpacing: -0.2, lineHeight: 26 },
  h3: { fontSize: 17, fontWeight: '700', letterSpacing: -0.1, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 21 },
  bodyStrong: { fontSize: 15, fontWeight: '600', lineHeight: 21 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  captionStrong: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  micro: { fontSize: 11, fontWeight: '500', letterSpacing: 0.2, lineHeight: 14 },
  overline: { fontSize: 11, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase', lineHeight: 14 },
};

// Layered, low-opacity shadows read as more "designed" than a single
// heavy shadow — softer ambient layer + tighter contact layer.
export const shadow = {
  xs: { shadowColor: '#0F2E24', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  sm: { shadowColor: '#0F2E24', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  md: { shadowColor: '#0F2E24', shadowOpacity: 0.10, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  lg: { shadowColor: '#0F2E24', shadowOpacity: 0.16, shadowRadius: 26, shadowOffset: { width: 0, height: 12 }, elevation: 10 },
};

export const entityColors = {
  medicine: { main: colors.primary, dark: colors.primaryDark, light: colors.primaryLight },
  appointment: { main: colors.secondary, dark: colors.secondaryDark, light: colors.secondaryLight },
  record: { main: colors.accentPurple, dark: colors.accentPurpleDark, light: colors.accentPurpleLight },
  cycle: { main: colors.accentPink, dark: colors.accentPinkDark, light: colors.accentPinkLight },
};

export const statusColors = {
  Pending: colors.warning,
  Taken: colors.primary,
  Skipped: colors.textMuted,
  Missed: colors.danger,
  Upcoming: colors.secondary,
  Completed: colors.primary,
};