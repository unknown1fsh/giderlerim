import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { TEMA_RENKLERI } from '@giderlerim/shared/utils/constants';

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

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: TEMA_RENKLERI.brand[500],
    primaryContainer: TEMA_RENKLERI.brand[100],
    secondary: TEMA_RENKLERI.brand[700],
    secondaryContainer: TEMA_RENKLERI.brand[50],
    error: TEMA_RENKLERI.error,
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceVariant: '#F0F1F3',
    onPrimary: '#FFFFFF',
    onBackground: '#111928',
    onSurface: '#111928',
    onSurfaceVariant: '#4B5563',
    outline: '#D1D5DB',
    surfaceDisabled: '#E5E7EB',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: '#FFFFFF',
      level1: '#F9FAFB',
      level2: '#F3F4F6',
      level3: '#E5E7EB',
    },
  },
  fonts: configureFonts({ config: fontConfig }),
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: TEMA_RENKLERI.brand[400],
    primaryContainer: TEMA_RENKLERI.brand[900],
    secondary: TEMA_RENKLERI.brand[300],
    secondaryContainer: TEMA_RENKLERI.brand[950],
    error: TEMA_RENKLERI.error,
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    onPrimary: '#FFFFFF',
    onBackground: '#F1F5F9',
    onSurface: '#F1F5F9',
    onSurfaceVariant: '#94A3B8',
    outline: '#475569',
    surfaceDisabled: '#1E293B',
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level0: '#0F172A',
      level1: '#1E293B',
      level2: '#334155',
      level3: '#475569',
    },
  },
  fonts: configureFonts({ config: fontConfig }),
};
