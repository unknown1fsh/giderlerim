import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
const fontConfig = {
  displayLarge: { fontFamily: 'System', fontWeight: '400' as const },
  displayMedium: { fontFamily: 'System', fontWeight: '400' as const },
  displaySmall: { fontFamily: 'System', fontWeight: '400' as const },
  headlineLarge: { fontFamily: 'System', fontWeight: '400' as const },
  headlineMedium: { fontFamily: 'System', fontWeight: '400' as const },
  headlineSmall: { fontFamily: 'System', fontWeight: '400' as const },
  titleLarge: { fontFamily: 'System', fontWeight: '500' as const },
  titleMedium: { fontFamily: 'System', fontWeight: '500' as const },
  titleSmall: { fontFamily: 'System', fontWeight: '500' as const },
  bodyLarge: { fontFamily: 'System', fontWeight: '400' as const },
  bodyMedium: { fontFamily: 'System', fontWeight: '400' as const },
  bodySmall: { fontFamily: 'System', fontWeight: '400' as const },
  labelLarge: { fontFamily: 'System', fontWeight: '500' as const },
  labelMedium: { fontFamily: 'System', fontWeight: '500' as const },
  labelSmall: { fontFamily: 'System', fontWeight: '500' as const },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
} as const;

export const appColors = {
  ink: '#0B0B0F',
  ink2: '#15151B',
  ink3: '#202028',
  orange: '#FF7A1A',
  orange2: '#FF9D2E',
  amber: '#FFC247',
  cream: '#FFF7ED',
  paper: '#FFFCF7',
  line: '#E7D8C8',
  muted: '#6F6258',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#E11D48',
} as const;

export const shadows = {
  card: {
    shadowColor: '#1F1308',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  lift: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: appColors.orange,
    primaryContainer: '#FFE3C2',
    secondary: appColors.ink,
    secondaryContainer: '#F3E8DC',
    tertiary: appColors.amber,
    error: appColors.danger,
    background: appColors.paper,
    surface: '#FFFFFF',
    surfaceVariant: '#F4E9DE',
    onPrimary: '#FFFFFF',
    onBackground: appColors.ink,
    onSurface: appColors.ink,
    onSurfaceVariant: appColors.muted,
    outline: appColors.line,
    surfaceDisabled: '#EFE3D8',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: appColors.paper,
      level1: '#FFFFFF',
      level2: '#FFF2E2',
      level3: '#FFE7C8',
    },
  },
  fonts: configureFonts({ config: fontConfig }),
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: appColors.orange2,
    primaryContainer: '#4B250C',
    secondary: appColors.amber,
    secondaryContainer: '#2B1B0F',
    tertiary: appColors.amber,
    error: '#FB7185',
    background: appColors.ink,
    surface: appColors.ink2,
    surfaceVariant: appColors.ink3,
    onPrimary: '#FFFFFF',
    onBackground: '#FFF7ED',
    onSurface: '#FFF7ED',
    onSurfaceVariant: '#C8B6A6',
    outline: '#3A3029',
    surfaceDisabled: '#242026',
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level0: appColors.ink,
      level1: appColors.ink2,
      level2: appColors.ink3,
      level3: '#352A23',
    },
  },
  fonts: configureFonts({ config: fontConfig }),
};
