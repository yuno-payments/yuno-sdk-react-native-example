/**
 * Yuno Color Palette
 * Supports Light Mode and Dark Mode based on Yuno's Design System
 */

export interface ColorPalette {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Secondary colors
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  
  // Tertiary colors (Tags, accents)
  tertiary: string;
  tertiaryLight: string;
  tertiaryDark: string;
  
  // Neutral colors
  background: string;
  surface: string;
  surfaceVariant: string;
  
  // Text colors
  text: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Border and dividers
  border: string;
  borderLight: string;
  divider: string;
  
  // Status colors
  success: string;
  successLight: string;
  error: string;
  errorLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;
  
  // Disabled state
  disabled: string;
  disabledText: string;
  
  // Overlay
  overlay: string;
  overlayLight: string;
  
  // Card and elevation
  card: string;
  cardBorder: string;
  elevation: string;
}

/**
 * Light Mode Color Palette
 * Based on Yuno's Design System
 */
export const lightColors: ColorPalette = {
  // Primary - Yuno Purple
  primary: '#4E3DD8',
  primaryLight: '#7B68FF',
  primaryDark: '#3A2FB3',
  
  // Secondary - Yuno Blue
  secondary: '#2196F3',
  secondaryLight: '#64B5F6',
  secondaryDark: '#1976D2',
  
  // Tertiary - Accent colors
  tertiary: '#00BCD4',
  tertiaryLight: '#4DD0E1',
  tertiaryDark: '#0097A7',
  
  // Neutral - Backgrounds
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F9FAFB',
  
  // Text colors
  text: '#1A1A1A',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',
  
  // Borders
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  divider: '#EEEEEE',
  
  // Status colors
  success: '#4CAF50',
  successLight: '#E8F5E9',
  error: '#F44336',
  errorLight: '#FFEBEE',
  warning: '#FF9800',
  warningLight: '#FFF3E0',
  info: '#2196F3',
  infoLight: '#E3F2FD',
  
  // Disabled
  disabled: '#BDBDBD',
  disabledText: '#9E9E9E',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
  
  // Card
  card: '#FFFFFF',
  cardBorder: '#E0E0E0',
  elevation: 'rgba(0, 0, 0, 0.1)',
};

/**
 * Dark Mode Color Palette
 * Based on Yuno's Design System
 */
export const darkColors: ColorPalette = {
  // Primary - Yuno Purple (adjusted for dark mode)
  primary: '#7B68FF',
  primaryLight: '#9D8CFF',
  primaryDark: '#4E3DD8',
  
  // Secondary - Yuno Blue (adjusted for dark mode)
  secondary: '#64B5F6',
  secondaryLight: '#90CAF9',
  secondaryDark: '#42A5F5',
  
  // Tertiary - Accent colors
  tertiary: '#4DD0E1',
  tertiaryLight: '#80DEEA',
  tertiaryDark: '#26C6DA',
  
  // Neutral - Dark backgrounds
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2A2A2A',
  
  // Text colors
  text: '#E0E0E0',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  textInverse: '#1A1A1A',
  
  // Borders
  border: '#3A3A3A',
  borderLight: '#2A2A2A',
  divider: '#303030',
  
  // Status colors (adjusted for dark mode)
  success: '#66BB6A',
  successLight: '#1B5E20',
  error: '#EF5350',
  errorLight: '#B71C1C',
  warning: '#FFA726',
  warningLight: '#E65100',
  info: '#64B5F6',
  infoLight: '#0D47A1',
  
  // Disabled
  disabled: '#4A4A4A',
  disabledText: '#606060',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  
  // Card
  card: '#2A2A2A',
  cardBorder: '#3A3A3A',
  elevation: 'rgba(0, 0, 0, 0.3)',
};

/**
 * Legacy colors object for backward compatibility
 * @deprecated Use useTheme() hook instead
 */
export const colors = lightColors;

export type ColorName = keyof ColorPalette;
