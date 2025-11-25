/**
 * Componente para las acciones de enrollment
 */

import React from 'react';
import {StyleSheet} from 'react-native';
import {Card} from './Card';
import {Button} from './Button';
import {spacing} from '../theme';

interface EnrollmentActionsProps {
  onEnrollment: () => void;
  loading?: boolean;
}

export const EnrollmentActions: React.FC<EnrollmentActionsProps> = ({
  onEnrollment,
  loading = false,
}) => {
  return (
    <Card title="🔐 Enrollment">
      <Button
        title="Enrollment Payment"
        onPress={onEnrollment}
        variant="primary"
        disabled={loading}
        style={styles.button}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  button: {
    marginBottom: spacing.sm,
  },
});

