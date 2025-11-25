/**
 * Componente para mostrar estados de Payment y Enrollment
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card} from './Card';
import {colors, spacing, typography} from '../theme';

interface StatusDisplayProps {
  paymentStatus?: string;
  enrollmentStatus?: string;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  paymentStatus,
  enrollmentStatus,
}) => {
  if (!paymentStatus && !enrollmentStatus) {
    return null;
  }

  return (
    <View>
      {paymentStatus && (
        <Card title="📊 Payment Status">
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{paymentStatus}</Text>
          </View>
        </Card>
      )}

      {enrollmentStatus && (
        <Card title="🔐 Enrollment Status">
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

