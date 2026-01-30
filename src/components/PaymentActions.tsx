/**
 * Payment actions component
 */

import React from 'react';
import {StyleSheet} from 'react-native';
import {Card} from './Card';
import {Button} from './Button';
import {spacing} from '../theme';
import {useTranslation} from '../i18n';

interface PaymentActionsProps {
  onStartPayment: () => void;
  onStartPaymentLite: () => void;
  onSeamlessPayment: () => void;
  onPaymentRender: () => void;
  loading?: boolean;
}

export const PaymentActions: React.FC<PaymentActionsProps> = ({
  onStartPayment,
  onStartPaymentLite,
  onSeamlessPayment,
  onPaymentRender,
  loading = false,
}) => {
  const t = useTranslation();

  return (
    <Card title={`💳 ${t.payment.title}`}>
      <Button
        testID="button-start-payment"
        title={t.payment.startPayment}
        onPress={onStartPayment}
        variant="primary"
        disabled={loading}
        style={styles.button}
      />
      <Button
        testID="button-start-payment-lite"
        title={t.payment.startPaymentLite}
        onPress={onStartPaymentLite}
        variant="primary"
        disabled={loading}
        style={styles.button}
      />
      <Button
        testID="button-seamless-payment"
        title={t.payment.seamlessPayment}
        onPress={onSeamlessPayment}
        variant="primary"
        disabled={loading}
        style={styles.button}
      />
      <Button
        testID="button-payment-render"
        title={t.payment.paymentRender}
        onPress={onPaymentRender}
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

