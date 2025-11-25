/**
 * Reusable button component
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import {colors, spacing, typography} from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const buttonStyle = [
    styles.button,
    styles[variant],
    isDisabled && styles.disabled,
    style,
  ];

  const textStyleFinal = [
    styles.text,
    styles[`${variant}Text`],
    isDisabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? colors.primary : colors.surface}
        />
      ) : (
        <Text style={textStyleFinal}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    ...typography.button,
  },
  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.surface,
  },
  secondary: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryText: {
    color: colors.primary,
  },
  success: {
    backgroundColor: colors.success,
  },
  successText: {
    color: colors.surface,
  },
  error: {
    backgroundColor: colors.error,
  },
  errorText: {
    color: colors.surface,
  },
  // States
  disabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
  },
  disabledText: {
    color: colors.textSecondary,
  },
});

