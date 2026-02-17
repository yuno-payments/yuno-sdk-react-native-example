/**
 * Payment actions component
 */

import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card} from './Card';
import {Button} from './Button';
import {spacing} from '../theme';

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
  return (
    <Card title="💳 Payment Options" subtitle="Choose your payment flow">
      <View style={styles.list}>
        <Button
          testID="button-start-payment"
          title="Full Checkout"
          onPress={onStartPayment}
          variant="primary"
          disabled={loading}
        />
        <Button
          testID="button-start-payment-lite"
          title="Payment Lite"
          onPress={onStartPaymentLite}
          variant="primary"
          disabled={loading}
        />
        <Button
          testID="button-seamless-payment"
          title="Seamless Payment"
          onPress={onSeamlessPayment}
          variant="primary"
          disabled={loading}
        />
        <Button
          testID="button-payment-render"
          title="Payment Render"
          onPress={onPaymentRender}
          variant="primary"
          disabled={loading}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
});
