/**
 * Enrollment actions component
 */

import React from 'react';
import {StyleSheet} from 'react-native';
import {Card} from './Card';
import {Button} from './Button';
import {spacing} from '../theme';
import {useTranslation} from '../i18n';

interface EnrollmentActionsProps {
  onEnrollment: () => void;
  loading?: boolean;
}

export const EnrollmentActions: React.FC<EnrollmentActionsProps> = ({
  onEnrollment,
  loading = false,
}) => {
  const t = useTranslation();

  return (
    <Card title={`🔐 ${t.enrollment.title}`}>
      <Button
        title={t.enrollment.startEnrollment}
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

