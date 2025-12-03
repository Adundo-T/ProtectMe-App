import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const protectMePalette = {
  primary: '#4B0082',
  primaryLight: '#6f1fa6',
  secondary: '#B57EDC',
  background: '#F3E8FF',
  card: '#FFFFFF',
  text: '#1F1A2B',
  muted: '#6B5A7A',
  success: '#2EAB66',
  warning: '#F5A524',
  danger: '#D94862',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
};

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: radii.md,
  colors: {
    ...MD3LightTheme.colors,
    primary: protectMePalette.primary,
    secondary: protectMePalette.secondary,
    background: protectMePalette.background,
    surface: protectMePalette.card,
    onSurface: protectMePalette.text,
    outline: protectMePalette.muted,
    error: protectMePalette.danger,
  },
};

