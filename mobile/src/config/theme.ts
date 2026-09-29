import { TextStyle, ViewStyle, ImageStyle } from 'react-native';

type NamedStyles<T> = { [P in keyof T]: TextStyle | ViewStyle | ImageStyle };

// ── shadcn-style tokens (RN port) ───────────────────────────────────────────
// Base: zinc neutrals + emerald primary (mountain green). Radius & shadow
// mengikuti gaya shadcn/ui: border halus, shadow lembut, sudut 10-14px.
export const Colors = {
  // Primary (emerald-600 default shadcn)
  primary: '#16A34A',
  primaryLight: '#22C55E',
  primaryDark: '#15803D',
  primaryFaded: '#DCFCE7',

  // Secondary
  secondary: '#18181B',
  secondaryLight: '#3F3F46',
  secondaryDark: '#09090B',
  secondaryFaded: '#F4F4F5',

  // Accent (Warm Amber)
  accent: '#F59E0B',
  accentLight: '#FBBF24',
  accentFaded: '#FEF3C7',

  // Semantic
  danger: '#DC2626',
  dangerLight: '#F87171',
  dangerFaded: '#FEE2E2',
  warning: '#D97706',
  warningLight: '#FBBF24',
  warningFaded: '#FEF3C7',
  success: '#16A34A',
  successLight: '#4ADE80',
  successFaded: '#DCFCE7',
  info: '#2563EB',
  infoLight: '#60A5FA',
  infoFaded: '#DBEAFE',

  // Neutral (zinc)
  background: '#FAFAF9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  muted: '#F4F4F5',
  text: '#09090B',
  textSecondary: '#52525B',
  textTertiary: '#A1A1AA',
  textInverse: '#FAFAF9',
  border: '#E4E4E7',
  borderLight: '#F4F4F5',
  ring: '#16A34A',
  disabled: '#D4D4D8',
  overlay: 'rgba(9,9,11,0.5)',

  // Verification badges
  badgeBronze: '#CD7F32',
  badgeSilver: '#C0C0C0',
  badgeGold: '#FFD700',
  badgeBackground: '#FFF8E1',

  // Map / terrain
  dangerZone: '#D32F2F',
  waterSource: '#1565C0',
  restPost: '#795548',
  trail: '#2E7D32',
  breadcrumb: '#FF6F00',
  sos: '#D32F2F',
  sosActive: '#B71C1C',
};

// Keep Colors values as plain strings so both palettes share the same shape.
export const DarkColors: typeof Colors = {
  primary: '#66BB6A',
  primaryLight: '#81C784',
  primaryDark: '#2E7D32',
  primaryFaded: '#1B5E20',

  secondary: '#7CB342',
  secondaryLight: '#9CCC65',
  secondaryDark: '#558B2F',
  secondaryFaded: '#33691E',

  accent: '#FFA000',
  accentLight: '#FFC107',
  accentFaded: '#E65100',

  danger: '#EF5350',
  dangerLight: '#E57373',
  dangerFaded: '#B71C1C',
  warning: '#FFB74D',
  warningLight: '#FFCC80',
  warningFaded: '#E65100',
  success: '#66BB6A',
  successLight: '#81C784',
  successFaded: '#1B5E20',
  info: '#42A5F5',
  infoLight: '#64B5F6',
  infoFaded: '#1565C0',

  background: '#09090B',
  surface: '#18181B',
  surfaceElevated: '#27272A',
  muted: '#27272A',
  text: '#FAFAF9',
  textSecondary: '#D4D4D8',
  textTertiary: '#71717A',
  textInverse: '#09090B',
  border: '#27272A',
  borderLight: '#1F1F23',
  ring: '#22C55E',
  disabled: '#52525B',
  overlay: 'rgba(0,0,0,0.7)',

  badgeBronze: '#CD7F32',
  badgeSilver: '#C0C0C0',
  badgeGold: '#FFD700',
  badgeBackground: '#3E2723',

  dangerZone: '#EF5350',
  waterSource: '#42A5F5',
  restPost: '#A1887F',
  trail: '#66BB6A',
  breadcrumb: '#FFA000',
  sos: '#EF5350',
  sosActive: '#C62828',
};

// ── Typography ────────────────────────────────────────────────────────────────
export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  subtitle1: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  subtitle2: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  overline: {
    fontSize: 10,
    fontWeight: '700' as const,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  link: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    textDecorationLine: 'underline' as const,
  },
  sosButton: {
    fontSize: 18,
    fontWeight: '800' as const,
    lineHeight: 24,
    letterSpacing: 1,
  },
} as const;

// ── Spacing (8px grid) ────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  // Specific semantic spacing
  screenPadding: 16,
  cardPadding: 16,
  cardGap: 12,
  sectionGap: 24,
  listItemGap: 12,
  tabBarHeight: 60,
  headerHeight: 56,
  sosButtonSize: 64,
  sosButtonMargin: 20,
} as const;

// ── Border Radius (shadcn: 0.625rem base) ────────────────────────────────────
export const BorderRadius = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 14,
  xl: 20,
  round: 9999,
} as const;

// ── Shadows (shadcn soft) ───────────────────────────────────────────────────
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  sos: {
    shadowColor: Colors.sos,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

// ── Full Theme Object ─────────────────────────────────────────────────────────
export interface Theme {
  dark: boolean;
  colors: typeof Colors;
  typography: typeof Typography;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  shadows: typeof Shadows;
}

export const LightTheme: Theme = {
  dark: false,
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
};

export const DarkTheme: Theme = {
  dark: true,
  colors: DarkColors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
};

// ── Helper hook style creator ─────────────────────────────────────────────────
export const createThemedStyles = <T extends NamedStyles<T>>(
  fn: (theme: Theme) => T,
) => fn;

export default LightTheme;
