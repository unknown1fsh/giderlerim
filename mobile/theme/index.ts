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
    surfaceVariant: '#F3F4F6',
    onPrimary: '#FFFFFF',
    onBackground: '#111928',
    onSurface: '#111928',
    outline: '#D1D5DB',
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
    background: '#1A1A2E',
    surface: '#1F2937',
    surfaceVariant: '#374151',
    onPrimary: '#FFFFFF',
    onBackground: '#F9FAFB',
    onSurface: '#F9FAFB',
    outline: '#4B5563',
  },
  fonts: configureFonts({ config: fontConfig }),
};
