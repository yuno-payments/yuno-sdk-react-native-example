/**
 * Modern status display component
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card} from './Card';
import {spacing} from '../theme';
import {useTranslation} from '../i18n';
import {useTheme} from '../hooks';

interface StatusDisplayProps {
  paymentStatus?: string;
  enrollmentStatus?: string;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  paymentStatus,
  enrollmentStatus,
}) => {
  const t = useTranslation();
  const {colors} = useTheme();
  const styles = createStyles(colors);

  if (!paymentStatus && !enrollmentStatus) {
    return <View />;
  }

  const getStatusStyle = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('success') || lowerStatus.includes('approved') || lowerStatus.includes('succeeded')) {
      return styles.statusSuccess;
    }
    if (lowerStatus.includes('error') || lowerStatus.includes('fail') || lowerStatus.includes('rejected')) {
      return styles.statusError;
    }
    if (lowerStatus.includes('pending') || lowerStatus.includes('processing')) {
      return styles.statusPending;
    }
    return styles.statusDefault;
  };

  const getStatusIcon = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('success') || lowerStatus.includes('approved') || lowerStatus.includes('succeeded')) {
      return '✅';
    }
    if (lowerStatus.includes('error') || lowerStatus.includes('fail') || lowerStatus.includes('rejected')) {
      return '❌';
    }
    if (lowerStatus.includes('pending') || lowerStatus.includes('processing')) {
      return '⏳';
    }
    return '📋';
  };

  return (
    <View>
      {paymentStatus && (
        <Card title="Payment Result" icon="📊" subtitle="Transaction status">
          <View style={[styles.statusContainer, getStatusStyle(paymentStatus)]}>
            <Text style={styles.statusIcon}>{getStatusIcon(paymentStatus)}</Text>
            <Text style={styles.statusText}>{paymentStatus}</Text>
          </View>
        </Card>
      )}

      {enrollmentStatus && (
        <Card title="Enrollment Result" icon="🔐" subtitle="Card saved status">
          <View style={[styles.statusContainer, getStatusStyle(enrollmentStatus)]}>
            <Text style={styles.statusIcon}>{getStatusIcon(enrollmentStatus)}</Text>
            <Text style={styles.statusText}>{enrollmentStatus}</Text>
          </View>
        </Card>
      )}
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: 12,
      gap: spacing.sm,
    },
    statusDefault: {
      backgroundColor: colors.surfaceVariant,
    },
    statusSuccess: {
      backgroundColor: colors.secondary2,
    },
    statusError: {
      backgroundColor: colors.secondary4,
    },
    statusPending: {
      backgroundColor: colors.secondary3,
    },
    statusIcon: {
      fontSize: 24,
    },
    statusText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textTransform: 'capitalize',
    },
  });
