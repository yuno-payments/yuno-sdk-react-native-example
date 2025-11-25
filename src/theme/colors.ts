/**
 * Color palette for the app
 */

export const colors = {
  // Primary colors
  primary: '#6200EE',
  primaryDark: '#3700B3',
  primaryLight: '#BB86FC',

  // Secondary colors
  secondary: '#03DAC6',
  secondaryDark: '#018786',
  
  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Neutral colors
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  disabled: '#BDBDBD',
  
  // Transparent
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export type ColorName = keyof typeof colors;

