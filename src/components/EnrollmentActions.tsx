/**
 * Enrollment actions component
 */

import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card} from './Card';
import {Button} from './Button';
import {spacing} from '../theme';

interface EnrollmentActionsProps {
  onEnrollment: () => void;
  onStartEnrollmentRender?: () => void;
  loading?: boolean;
}

export const EnrollmentActions: React.FC<EnrollmentActionsProps> = ({
  onEnrollment,
  onStartEnrollmentRender,
  loading = false,
}) => {
  return (
    <Card title="🔐 Enrollment Options" subtitle="Save cards for faster checkout">
      <View style={styles.list}>
        <Button
          testID="button-enrollment"
          title="Full Enrollment"
          onPress={onEnrollment}
          variant="success"
          disabled={loading}
        />
        {onStartEnrollmentRender && (
          <Button
            testID="button-enrollment-render"
            title="Enrollment Render"
            onPress={onStartEnrollmentRender}
            variant="success"
            disabled={loading}
          />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
});
