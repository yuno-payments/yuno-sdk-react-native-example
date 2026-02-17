/**
 * Modern input component with improved styling
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
  Animated,
} from 'react-native';
import {spacing, typography} from '../theme';
import {useTheme} from '../hooks';

interface InputProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  icon?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  hint,
  error,
  icon,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, isFocused && styles.labelFocused]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
        ]}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon, style]}
          placeholderTextColor={colors.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />
      </View>
      {(hint || error) && (
        <Text style={[styles.hint, error && styles.errorText]}>
          {error || hint}
        </Text>
      )}
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      letterSpacing: 0.2,
      textTransform: 'uppercase',
    },
    labelFocused: {
      color: colors.primary1,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant,
      borderWidth: 1.5,
      borderColor: colors.borderLight,
      borderRadius: 12,
      overflow: 'hidden',
    },
    inputWrapperFocused: {
      borderColor: colors.primary1,
      backgroundColor: colors.card,
    },
    inputWrapperError: {
      borderColor: colors.error,
    },
    icon: {
      fontSize: 18,
      paddingLeft: spacing.md,
      color: colors.textSecondary,
    },
    input: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      paddingVertical: spacing.md - 2,
      paddingHorizontal: spacing.md,
      color: colors.text,
      minHeight: 48,
    },
    inputWithIcon: {
      paddingLeft: spacing.sm,
    },
    hint: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: spacing.xs,
      paddingLeft: spacing.xs,
    },
    errorText: {
      color: colors.error,
    },
  });
