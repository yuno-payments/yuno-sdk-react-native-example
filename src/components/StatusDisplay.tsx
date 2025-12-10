/**
 * Component to display Payment and Enrollment status
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card} from './Card';
import {colors, spacing, typography} from '../theme';
import {useTranslation} from '../i18n';

interface StatusDisplayProps {
  paymentStatus?: string;
  enrollmentStatus?: string;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  paymentStatus,
  enrollmentStatus,
}) => {
  const t = useTranslation();

  if (!paymentStatus && !enrollmentStatus) {
    // Return empty View to maintain position in layout
    return <View />;
  }

  return (
    <View>
      {paymentStatus && (
        <Card title={`📊 ${t.status.paymentStatus}`}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{paymentStatus}</Text>
          </View>
        </Card>
      )}

      {enrollmentStatus && (
        <Card title={`🔐 ${t.status.enrollmentStatus}`}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{enrollmentStatus}</Text>
          </View>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  statusContainer: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
  },
  statusText: {
    ...typography.body,
    color: colors.text,
    fontFamily: 'monospace',
  },
});

