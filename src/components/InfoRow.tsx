/**
 * Component to display information in key-value format
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, spacing, typography} from '../theme';

interface InfoRowProps {
  label: string;
  value: string | number | null | undefined;
}

export const InfoRow: React.FC<InfoRowProps> = ({label, value}) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value || 'N/A'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  value: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
});

