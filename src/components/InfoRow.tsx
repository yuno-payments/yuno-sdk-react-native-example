/**
 * Component to display information in key-value format
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {spacing, typography} from '../theme';
import {useTheme} from '../hooks';

interface InfoRowProps {
  label: string;
  value: string | number | null | undefined;
}

export const InfoRow: React.FC<InfoRowProps> = ({label, value}) => {
  const {colors} = useTheme();
  const styles = createStyles(colors);
  
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value || 'N/A'}</Text>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
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

