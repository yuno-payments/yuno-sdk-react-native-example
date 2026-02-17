/**
 * Modern Card component with improved styling
 */

import React from 'react';
import {View, Text, StyleSheet, type ViewStyle} from 'react-native';
import {spacing, typography} from '../theme';
import {useTheme} from '../hooks';

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  icon,
  children,
  style,
  variant = 'default',
}) => {
  const {colors} = useTheme();
  const styles = createStyles(colors);

  const cardStyle = [
    styles.card,
    variant === 'elevated' && styles.cardElevated,
    variant === 'outlined' && styles.cardOutlined,
    variant === 'gradient' && styles.cardGradient,
    style,
  ];

  return (
    <View style={cardStyle}>
      {(title || icon) && (
        <View style={styles.header}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <View style={styles.headerText}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
      )}
      {children}
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
      // Softer shadow
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    cardElevated: {
      borderWidth: 0,
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 8,
    },
    cardOutlined: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.border,
      shadowOpacity: 0,
      elevation: 0,
    },
    cardGradient: {
      borderWidth: 0,
      borderColor: colors.primary1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    icon: {
      fontSize: 24,
      marginRight: spacing.sm,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });
