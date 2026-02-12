/**
 * Modern enrollment actions component
 */

import React from 'react';
import {Card} from './Card';
import {Button} from './Button';
import {useTranslation} from '../i18n';

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
  const t = useTranslation();

  return (
    <Card title="Save Payment Method" icon="🔐" subtitle="Enroll cards for faster checkout">
      <Button
        testID="button-enrollment"
        title="Start Enrollment"
        icon="➕"
        onPress={onEnrollment}
        variant="success"
        disabled={loading}
      />
      {onStartEnrollmentRender && (
        <Button
          testID="button-enrollment-render"
          title="Enrollment Render"
          icon="💳"
          onPress={onStartEnrollmentRender}
          variant="primary"
          disabled={loading}
        />
      )}
    </Card>
  );
};
