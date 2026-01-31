/**
 * Modern button component with improved styling
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import {spacing, typography} from '../theme';
import {useTheme} from '../hooks';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
  textStyle,
  testID,
}) => {
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const isDisabled = disabled || loading;

  const buttonStyle = [
    styles.button,
    styles[`button_${size}`],
    styles[variant],
    isDisabled && styles.disabled,
    !fullWidth && styles.autoWidth,
    style,
  ];

  const textStyleFinal = [
    styles.text,
    styles[`text_${size}`],
    styles[`${variant}Text`],
    isDisabled && styles.disabledText,
    textStyle,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={variant === 'secondary' || variant === 'ghost' ? colors.primary1 : '#FFFFFF'}
          size="small"
        />
      );
    }

    return (
      <View style={styles.content}>
        {icon && iconPosition === 'left' && (
          <Text style={[styles.icon, textStyleFinal]}>{icon}</Text>
        )}
        <Text style={textStyleFinal}>{title}</Text>
        {icon && iconPosition === 'right' && (
          <Text style={[styles.icon, styles.iconRight, textStyleFinal]}>{icon}</Text>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      testID={testID}
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}>
      {renderContent()}
    </TouchableOpacity>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    button: {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    autoWidth: {
      alignSelf: 'flex-start',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      marginRight: spacing.xs,
    },
    iconRight: {
      marginRight: 0,
      marginLeft: spacing.xs,
    },
    text: {
      fontWeight: '600',
      letterSpacing: 0.2,
    },
    // Sizes
    button_small: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      minHeight: 36,
    },
    button_medium: {
      paddingVertical: spacing.md - 2,
      paddingHorizontal: spacing.lg,
      minHeight: 48,
    },
    button_large: {
      paddingVertical: spacing.md + 2,
      paddingHorizontal: spacing.xl,
      minHeight: 56,
    },
    text_small: {
      fontSize: 13,
    },
    text_medium: {
      fontSize: 15,
    },
    text_large: {
      fontSize: 17,
    },
    // Variants
    primary: {
      backgroundColor: colors.primary1,
      shadowColor: colors.primary1,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryText: {
      color: '#FFFFFF',
    },
    secondary: {
      backgroundColor: colors.secondary1,
      borderWidth: 0,
    },
    secondaryText: {
      color: colors.primary1,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    ghostText: {
      color: colors.primary1,
    },
    success: {
      backgroundColor: colors.success,
      shadowColor: colors.success,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    successText: {
      color: '#FFFFFF',
    },
    error: {
      backgroundColor: colors.error,
      shadowColor: colors.error,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    errorText: {
      color: '#FFFFFF',
    },
    // States
    disabled: {
      backgroundColor: colors.disabled,
      borderColor: colors.disabled,
      shadowOpacity: 0,
      elevation: 0,
    },
    disabledText: {
      color: colors.disabledText,
    },
  });
