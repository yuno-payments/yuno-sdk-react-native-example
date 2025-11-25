/**
 * Componente para las acciones de pago
 */

import React from 'react';
import {StyleSheet} from 'react-native';
import {Card} from './Card';
import {Button} from './Button';
import {spacing} from '../theme';

interface PaymentActionsProps {
  onStartPayment: () => void;
  onStartPaymentLite: () => void;
  onEnrollment: () => void;
  onSeamlessPayment: () => void;
  loading?: boolean;
}

export const PaymentActions: React.FC<PaymentActionsProps> = ({
  onStartPayment,
  onStartPaymentLite,
  onEnrollment,
  onSeamlessPayment,
  loading = false,
}) => {
  return (
    <Card title="💳 Acciones de Pago">
      <Button
        title="Start Payment (Full Flow)"
        onPress={onStartPayment}
        variant="primary"
        disabled={loading}
        style={styles.button}
      />
      <Button
        title="Start Payment Lite"
        onPress={onStartPaymentLite}
        variant="primary"
        disabled={loading}
        style={styles.button}
      />
      <Button
        title="Enrollment Payment"
        onPress={onEnrollment}
        variant="primary"
        disabled={loading}
        style={styles.button}
      />
      <Button
        title="Seamless Payment"
        onPress={onSeamlessPayment}
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

